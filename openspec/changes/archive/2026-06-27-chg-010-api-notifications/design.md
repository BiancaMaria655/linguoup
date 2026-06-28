## Context

O domínio de notificações é novo no backend. Atualmente não existe nenhuma infraestrutura de envio de mensagens (push ou e-mail) no projeto. O objetivo do MVP é implementar:

1. **Histórico de notificações** — CRUD leve para consultar e marcar como lida.
2. **Lembrete diário** — scheduler cron que dispara push (FCM) e/ou e-mail (SES) no horário preferido do usuário (definido em CHG-005).

O serviço é síncrono no MVP: o cron executa o envio diretamente, sem fila. A extração para um microserviço com SQS/SNS é planejada para V2.

Dependências diretas:
- **CHG-005** (users) — preferências de `studyReminderTime` e `studyFrequency` por usuário.
- **Prisma schema** — nova tabela `Notification` (precisará de migration aprovada).

## Goals / Non-Goals

**Goals:**
- Implementar `NotificationsModule` em `apps/api/src/notifications/` seguindo Clean Architecture.
- Expor 3 endpoints REST (`GET`, `PATCH`, `POST /test`) com autenticação JWT e RBAC.
- Criar `DailyReminderScheduler` com `@Cron` que respeita o horário e frequência preferidos de cada usuário.
- Integrar FCM (push) e AWS SES (e-mail) como canais de envio, com falha isolada por canal.
- Garantir que o scheduler nunca envie mais de uma notificação por usuário por dia.
- Cobertura de testes: 80 % das regras de negócio (unitários) + integração com mocks de FCM/SES.

**Non-Goals:**
- Filas dedicadas (SQS/SNS) — V2.
- WebSocket / notificações em tempo real — V3.
- Notificações de conquistas (já cobertas por CHG-008).
- Segmentação ou campanhas de marketing.
- Preferências de notificação além do lembrete diário (V2).

## Decisions

### D1 — Síncrono no MVP, sem fila

**Decisão:** O `DailyReminderScheduler` chama FCM e SES diretamente via `HttpService` / SDK, dentro do processo NestJS.

**Alternativas consideradas:**
- BullMQ + Redis — adiciona complexidade operacional e nova dependência sem ganho claro no MVP.
- AWS SQS/SNS — infraestrutura extra; reservada para V2 quando o volume justificar.

**Razão:** Simplicidade. O número de usuários no MVP não justifica uma fila. A arquitetura já prevê essa evolução.

---

### D2 — Firebase Admin SDK para FCM (server-side)

**Decisão:** Usar `firebase-admin` (SDK oficial) para envio de push notifications via FCM.

**Alternativas consideradas:**
- HTTP v1 API direto — equivalente em funcionalidade, mas o SDK gerencia autenticação automaticamente.
- OneSignal — abstração extra, fora do stack atual.

**Razão:** O SDK é a forma recomendada pelo Google para envio server-side; já gerencia tokens de acesso e retry básico.

---

### D3 — AWS SES via `@aws-sdk/client-ses`

**Decisão:** Usar o SDK oficial AWS v3 (`@aws-sdk/client-ses`) para envio de e-mails.

**Alternativas consideradas:**
- Nodemailer — genérico, mas requer adaptador para SES; SDK v3 é mais direto.
- SendGrid — fora do stack definido no AGENTS.md.

**Razão:** Consistência com a stack AWS já planejada (S3, CloudFront, Cognito V3).

---

### D4 — Tabela `Notification` no Prisma

**Decisão:** Criar tabela `Notification` com campos: `id`, `userId`, `type` (enum: `REMINDER`, `SYSTEM`), `channel` (enum: `PUSH`, `EMAIL`), `message`, `readAt` (nullable), `sentAt`, `createdAt`.

**Alternativas consideradas:**
- Armazenar notificações somente em cache Redis — sem histórico persistente; inviável para o endpoint `GET /notifications`.
- JSON em coluna do usuário — não escalável para paginação/filtragem.

**Razão:** Histórico consultável e auditável. O tamanho esperado no MVP é pequeno (< 100 notificações/usuário/ano).

---

### D5 — Deduplicação de lembretes por dia

**Decisão:** Antes de enviar, o scheduler verifica se já existe registro `Notification` com `type=REMINDER`, `sentAt` dentro do dia UTC atual para o usuário. Se sim, pula.

**Alternativas consideradas:**
- Flag Redis com TTL de 24h — mais rápido, mas cria dependência de sincronização entre Redis e PostgreSQL.

**Razão:** PostgreSQL já é a fonte de verdade; a consulta é barata no MVP.

## Risks / Trade-offs

| Risco | Mitigação |
|-------|-----------|
| FCM ou SES indisponíveis no momento do cron | Capturar exceção por canal; logar erro com `trace_id`; não abortar envio para outros usuários. Retry manual pela equipe via endpoint `/test`. |
| Token FCM expirado para o usuário | Tratar erro `UNREGISTERED` do FCM; remover token do usuário (atualizar User.fcmToken = null). |
| Scheduler rodando em múltiplas instâncias (horizontal scaling) | No MVP (single instance) não é problema. No V2, adicionar distributed lock via Redis ou migrar para AWS EventBridge. Documentar este risco no README do módulo. |
| Volume de e-mails excede cota SES sandbox | Usar conta SES em produção (fora do sandbox) e monitorar bounce rate. No MVP, limitar envio ao horário UTC preferido (sem fallback de fuso). |
| Migration em banco de produção | Sempre executar `pnpm db:migrate` em janela de manutenção, com rollback via `migration.down` testado localmente. |

## Migration Plan

1. **Aprovação do schema**: Apresentar a migration `Notification` para revisão antes de executar `pnpm db:migrate:dev`.
2. **Variáveis de ambiente**: Adicionar ao `.env.example`: `FCM_SERVICE_ACCOUNT_JSON`, `AWS_SES_FROM_EMAIL`, `AWS_SES_REGION`.
3. **Deploy incremental**:
   - Implantar migration em staging → executar smoke tests.
   - Verificar scheduler com FCM/SES sandbox.
   - Promover para produção com Blue-Green (sem downtime).
4. **Rollback**: Remover tabela `Notification` via migration reversa; desabilitar `NotificationsModule` via feature flag de env.
