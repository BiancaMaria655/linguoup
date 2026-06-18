# CHG-010 — API: Notificações (Notifications Domain)

## Versão do Roadmap
**V1 — MVP**

## Descrição
Implementação do domínio de notificações no backend NestJS: histórico de notificações do usuário, marcação como lida, e disparo de lembretes de estudo diário via push (Firebase Cloud Messaging) e e-mail (AWS SES). No MVP, o envio é síncrono (não há fila dedicada).

## Contexto
Dependências: CHG-005 (users — preferências de horário e frequência). No V2, o serviço de notificações será extraído com suporte a filas (AWS SQS/SNS). No MVP, a lógica de envio fica embutida no backend NestJS como um `NotificationService` interno.

## Escopo

### O que está incluído

**Endpoints protegidos:**
- `GET /api/v1/notifications` — histórico de notificações do usuário (paginado)
- `PATCH /api/v1/notifications/{id}/read` — marcar notificação como lida
- `POST /api/v1/notifications/test` — endpoint de teste de push (apenas `ADMIN`)

**Serviço interno (sem endpoint dedicado):**
- `DailyReminderScheduler` — tarefa cron (NestJS `@Cron`) que roda diariamente no horário configurado pelo usuário e envia push via FCM
- `NotificationFactory` — cria registro de notificação no banco antes do envio

**Integrações:**
- Firebase Cloud Messaging (FCM) — push para mobile (iOS e Android)
- AWS SES — e-mail de lembrete (fallback ou preferência do usuário)
- Credenciais via variáveis de ambiente (não hardcoded)

**Testes:**
- Unitários: `NotificationFactory`, lógica de frequência (não envia mais de X vezes/dia)
- Integração: testar scheduler com mock de FCM e SES

### Non-goals
- Fila dedicada (SQS/SNS) — V2
- Notificações em tempo real via WebSocket — V3
- Notificações de conquistas (as conquistas já retornam no response de `complete` — CHG-008)
- Segmentação avançada de usuários para campanhas

## Endpoints OpenAPI

```yaml
GET /api/v1/notifications:
  auth: Bearer
  query: { cursor?, limit?: 20, unreadOnly?: bool }
  response:
    data: [{ id, type, message, readAt, createdAt }]
    metadata: { cursor, total, unreadCount }

PATCH /api/v1/notifications/{id}/read:
  auth: Bearer
  response: { data: { id, readAt } }

POST /api/v1/notifications/test:
  auth: Bearer (ADMIN only)
  request: { userId, message }
  response: { data: { sent: true } }
```

## Tamanho, Complexidade e Risco
| Dimensão    | Avaliação | Justificativa |
|-------------|-----------|---------------|
| Tamanho     | Médio     | 3 endpoints + integração FCM + SES + scheduler |
| Complexidade| Média     | Integrações externas (FCM, SES) e scheduler cron |
| Risco       | Médio     | Integrações externas podem falhar; tratamento de erros e retry necessários |

## Plano de Verificação
```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
# Testar com credenciais FCM/SES de sandbox
# Verificar que scheduler não envia duplicatas
# Verificar que usuário sem preferência de horário não recebe notificação
```
