## 1. Prisma Schema — SpacedReviewItem

- [x] 1.1 Adicionar model `SpacedReviewItem` ao schema Prisma com campos: `id`, `userId`, `tenantId`, `lessonId`, `itemContent`, `itemType` (vocab/grammar), `interval`, `easeFactor`, `repetitions`, `quality`, `nextReviewAt`, `createdAt`, `updatedAt`
- [x] 1.2 Adicionar índices: `(userId, tenantId, nextReviewAt)` para a query de recomendados e índice único `(userId, lessonId, itemContent)` para evitar duplicatas
- [x] 1.3 Criar migration com `pnpm db:migrate:dev` (requer aprovação prévia) e verificar rollback documentado

## 2. Domínio — SM2AlgorithmService

- [x] 2.1 Criar `apps/api/src/learning/services/sm2-algorithm.service.ts` com o método `calculate(state: SM2State, quality: number): SM2Result` implementando o algoritmo SM-2 exato do proposal (clamping `easeFactor >= 1.3`, `interval >= 1`)
- [x] 2.2 Criar tipos `SM2State` e `SM2Result` em `apps/api/src/learning/services/sm2.types.ts`
- [x] 2.3 Escrever testes unitários em `sm2-algorithm.service.spec.ts` cobrindo: quality 0 (reset), quality 3 (mínimo de sucesso), quality 5 (crescimento máximo), clamping do easeFactor, cálculo preciso do nextReviewAt — cobertura ≥ 80%

## 3. Domínio — SpacedReviewItem entity & repository interface

- [x] 3.1 Criar entity `SpacedReviewItem` em `apps/api/src/learning/repositories/spaced-review-item.entity.ts`
- [x] 3.2 Criar interface `ISpacedReviewItemRepository` em `apps/api/src/learning/repositories/spaced-review-item.entity.ts` com métodos: `findDueByUser`, `createMany`, `findByUserAndLesson`, `update`
- [x] 3.3 Implementar `PrismaSpacedReviewItemRepository` em `apps/api/src/learning/repositories/spaced-review-item.repository.ts` usando `prisma.$transaction` e validando `tenantId`

## 4. Use Cases — Application Layer

- [x] 4.1 Criar `GetRecommendedReviewsUseCase` em `apps/api/src/learning/use-cases/get-recommended-reviews.use-case.ts`: filtra `nextReviewAt <= now()`, ordena por `nextReviewAt ASC`, aplica `limit` (default 20, max 100), retorna `data[]` + `metadata { total, overdueCount }`. Valida `userId` e `tenantId`.
- [x] 4.2 Criar `CompleteReviewUseCase` em `apps/api/src/learning/use-cases/complete-review.use-case.ts`: recebe `reviewItemId` + `quality (0–5)`, chama `SM2AlgorithmService.calculate()`, persiste novo estado, chama `AwardXpUseCase` (não-crítico: log e continua em caso de falha), retorna `{ nextReviewAt, interval, easeFactor, xpEarned }`
- [x] 4.3 Criar `CreateSpacedReviewItemsUseCase` em `apps/api/src/learning/use-cases/create-spaced-review-items.use-case.ts`: cria `SpacedReviewItem` para cada item da lição com estado SM-2 inicial (`easeFactor=2.5, interval=1, repetitions=0, nextReviewAt=now+1day`), com upsert para evitar duplicatas
- [x] 4.4 Integrar `CreateSpacedReviewItemsUseCase` na conclusão de lição (`CompleteLesson` use case existente) dentro da mesma transação Prisma — verificar que não quebra testes existentes

## 5. Testes Unitários — Use Cases

- [x] 5.1 Escrever testes unitários para `GetRecommendedReviewsUseCase`: filtragem por data, ordenação, limit, overdueCount, isolamento por tenantId, lista vazia — cobertura ≥ 80%
- [x] 5.2 Escrever testes unitários para `CompleteReviewUseCase`: delegação ao SM2Service, persistência, falha não-crítica do XP (deve continuar), output correto
- [x] 5.3 Escrever testes unitários para `CreateSpacedReviewItemsUseCase`: criação de itens, upsert (sem duplicatas), estado inicial correto

## 6. Controller & DTOs

- [x] 6.1 Criar `ReviewsController` em `apps/api/src/learning/controllers/reviews.controller.ts` com decorators NestJS (`@Controller('reviews')`, `@UseGuards(JwtAuthGuard)`, `@ApiBearerAuth()`)
- [x] 6.2 Criar DTO `GetRecommendedReviewsQueryDto` com validação: `limit?: number` (min 1, max 100, default 20) usando `class-validator`
- [x] 6.3 Criar DTO `CompleteReviewBodyDto` com validação: `reviewItemId: string (UUID)`, `quality: number (int, min 0, max 5)`
- [x] 6.4 Implementar `GET /api/v1/reviews/recommended` no controller com decorators OpenAPI (`@ApiOperation`, `@ApiResponse`)
- [x] 6.5 Implementar `POST /api/v1/reviews/complete` no controller com decorators OpenAPI
- [x] 6.6 Registrar `ReviewsController` e dependências no `LearningModule`

## 7. Observabilidade

- [x] 7.1 Adicionar logs estruturados em todos os use cases: `{ timestamp, level, service: 'reviews', trace_id, user_id, tenant_id, action }` — nunca logar conteúdo sensível
- [x] 7.2 Adicionar spans OpenTelemetry em `GetRecommendedReviewsUseCase` e `CompleteReviewUseCase` com atributos: `userId`, `tenantId`, `itemCount` / `reviewItemId`
- [x] 7.3 Registrar métrica de latência p50/p95/p99 por endpoint via interceptor existente (verificar se já existe ou criar)

## 8. Testes de Integração

- [x] 8.1 Escrever teste de integração cobrindo o fluxo completo: completar lição → itens de revisão criados → `GET /reviews/recommended` retorna os itens → `POST /reviews/complete` com quality=4 → próximo intervalo calculado corretamente
- [x] 8.2 Escrever teste de integração para isolamento multi-tenant: usuário de tenant A não vê itens de tenant B
- [x] 8.3 Verificar que re-completar a mesma lição não cria itens duplicados (upsert)

## 9. Validação Final

- [x] 9.1 Executar `pnpm lint && pnpm typecheck && pnpm test && pnpm build` — todos devem passar sem erros
- [x] 9.2 Verificar documentação OpenAPI gerada em `/api` (Swagger) com os dois novos endpoints documentados
- [x] 9.3 Testar manualmente: SM-2 com quality 0 → intervalo deve resetar para 1 dia; SM-2 com quality 5 → easeFactor cresce progressivamente

