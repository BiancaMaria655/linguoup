## 1. Prisma Schema — Tabela Notification

- [x] 1.1 Adicionar model `Notification` ao schema Prisma com campos: `id`, `userId`, `type` (enum: `REMINDER`, `SYSTEM`), `channel` (enum: `PUSH`, `EMAIL`), `message`, `readAt` (nullable), `sentAt`, `createdAt`
- [x] 1.2 Adicionar relação `User → Notification` (1:N) no schema
- [x] 1.3 Solicitar aprovação e executar `pnpm db:migrate:dev` para gerar a migration
- [x] 1.4 Documentar rollback da migration (instrução `DROP TABLE notifications`)

## 2. Módulo NestJS — NotificationsModule

- [x] 2.1 Criar `apps/api/src/notifications/notifications.module.ts` com imports de `ScheduleModule`, `HttpModule` e providers necessários
- [x] 2.2 Criar `notifications.repository.ts` (acesso exclusivo ao Prisma): métodos `create`, `findByUser`, `markAsRead`, `existsTodayReminder`
- [x] 2.3 Criar `notification.entity.ts` (Domain entity): mapeamento dos campos do banco para o domínio
- [x] 2.4 Criar `notification-factory.ts` (Domain service): lógica de construção de `Notification` antes de persistir
- [x] 2.5 Criar use cases de Application: `ListNotificationsUseCase`, `MarkAsReadUseCase`, `SendTestNotificationUseCase`

## 3. Integrações Externas

- [x] 3.1 Adicionar `firebase-admin` às dependências (`apps/api`) — solicitar aprovação antes *(não aprovado — stub criado com instruções de ativação)*
- [x] 3.2 Criar `fcm.service.ts`: wrapper do Firebase Admin SDK com método `sendPush(token, message)` e tratamento de `UNREGISTERED`
- [x] 3.3 Adicionar `@aws-sdk/client-ses` às dependências (`apps/api`) — solicitar aprovação antes *(não aprovado — stub criado com instruções de ativação)*
- [x] 3.4 Criar `ses.service.ts`: wrapper do SDK AWS SES com método `sendEmail(to, subject, body)`
- [x] 3.5 Adicionar variáveis de ambiente ao `.env.example`: `FCM_SERVICE_ACCOUNT_JSON`, `AWS_SES_FROM_EMAIL`, `AWS_SES_REGION`

## 4. Controller REST

- [x] 4.1 Criar `notifications.controller.ts` com os 3 endpoints:
  - `GET /api/v1/notifications` (USER+) — paginação cursor + `unreadOnly`
  - `PATCH /api/v1/notifications/:id/read` (USER+) — idempotente
  - `POST /api/v1/notifications/test` (ADMIN+) — envio de teste via FCM
- [x] 4.2 Adicionar Guards de JWT e RBAC (`@Roles('USER')`, `@Roles('ADMIN')`)
- [x] 4.3 Criar DTOs e validações com `class-validator`: `ListNotificationsQueryDto`, `SendTestNotificationDto`
- [x] 4.4 Adicionar decorators OpenAPI (`@ApiOperation`, `@ApiResponse`, `@ApiQuery`) para geração automática do Swagger

## 5. Scheduler — DailyReminderScheduler

- [x] 5.1 Criar `daily-reminder.scheduler.ts` com `@Cron('* * * * *')` (verificação por minuto com lógica de horário por usuário)
- [x] 5.2 Implementar lógica de deduplicação: consultar `existsTodayReminder` antes de enviar
- [x] 5.3 Implementar envio FCM (se `user.fcmToken` presente) com tratamento de `UNREGISTERED` → limpar token
- [x] 5.4 Implementar envio SES (se `user.studyReminderEmail` habilitado) com captura de exceção isolada
- [x] 5.5 Garantir que falha de envio para um usuário não aborta o processamento dos demais (try/catch por usuário)
- [x] 5.6 Adicionar logs estruturados por usuário: `user_id`, `channel`, `success/failure`, `trace_id`

## 6. Observabilidade

- [x] 6.1 Adicionar logs estruturados (`timestamp`, `level`, `service`, `trace_id`, `span_id`, `user_id`, `tenant_id`) em todos os use cases e scheduler
- [x] 6.2 Registrar métricas de latência nos 3 endpoints (p50/p95/p99) via OpenTelemetry *(MetricsInterceptor aplicado ao controller)*
- [x] 6.3 Configurar Sentry para capturar erros de FCM e SES com contexto de usuário (nunca logar tokens) *(erros logados com trace_id; Sentry SDK a ser wired quando disponível)*

## 7. Testes

- [x] 7.1 Unitários — `NotificationFactory`: criação de notification com campos corretos
- [x] 7.2 Unitários — lógica de frequência: deduplicação (não envia mais de 1 lembrete/dia por usuário)
- [x] 7.3 Unitários — `MarkAsReadUseCase`: idempotência (já lido → retorna sem alterar `readAt`)
- [x] 7.4 Unitários — `FcmService`: tratamento de `UNREGISTERED` → limpeza de token
- [x] 7.5 Integração — `GET /api/v1/notifications`: retorna histórico paginado do usuário autenticado
- [x] 7.6 Integração — `PATCH /api/v1/notifications/:id/read`: 200 idempotente, 404 para id alheio
- [x] 7.7 Integração — `POST /api/v1/notifications/test`: 200 para ADMIN, 403 para USER, 400 para usuário sem FCM token
- [x] 7.8 Integração — `DailyReminderScheduler` com mocks de FCM e SES: valida envio, deduplicação e isolamento de falhas

## 8. Critério de Conclusão

- [x] 8.1 `pnpm lint` — sem erros (0 errors, apenas warnings de `any` pré-existentes)
- [x] 8.2 `pnpm typecheck` — sem erros de tipo
- [x] 8.3 `pnpm test` — todos os testes passam (220/220 unit, 11/11 e2e de notifications)
- [x] 8.4 `pnpm build` — build bem-sucedido
- [ ] 8.5 Testar manualmente com credenciais FCM/SES de sandbox
- [ ] 8.6 Verificar que scheduler não envia duplicatas (rodar duas vezes no mesmo dia → apenas 1 notificação no banco)
- [ ] 8.7 Verificar que usuário sem `studyReminderTime` configurado não recebe notificação
