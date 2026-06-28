## 1. Schema e Migration

- [x] 1.1 Adicionar campo `dailyGoalLessons Int @default(1)` ao model `UserPreferences` no `packages/database/prisma/schema.prisma`
- [x] 1.2 Criar migration não-destrutiva via `pnpm db:migrate:dev` com nome `add_daily_goal_lessons` (requer aprovação prévia)
- [x] 1.3 Verificar rollback: confirmar que `DROP COLUMN dailyGoalLessons` pode ser executado sem perda de dados críticos

## 2. ProgressRepository — Extensão de Queries

- [x] 2.1 Adicionar método `findProgressWithCompletions(userId: string)` no `ProgressRepository`: busca `UserProgress` + `LessonCompletion` com join em `Lesson.durationMinutes` para calcular `minutesStudied`
- [x] 2.2 Adicionar método `findWeeklyActivity(userId: string, days: number)`: retorna `LessonCompletion` agrupadas por data dos últimos N dias (usar Prisma `groupBy` ou `findMany` + agregação em memória)
- [x] 2.3 Adicionar método `findActivityCalendar(userId: string, days: number)`: retorna array de `{ date, active }` com os últimos N dias — agrupamento por data de `completedAt`

## 3. Use Cases — Progress e Streak

- [x] 3.1 Criar `GetProgressUseCase` em `apps/api/src/learning/use-cases/get-progress.use-case.ts`: orquestra `ProgressRepository.findProgressWithCompletions` + `findWeeklyActivity`, calcula `vocabularyLearned = lessonsCompleted * 6`, monta response com `weeklyActivity` (7 dias) e `monthlyActivity` (4 semanas ISO)
- [x] 3.2 Criar `GetStreakUseCase` em `apps/api/src/learning/use-cases/get-streak.use-case.ts`: lê `UserProgress` (streak e `lastActivityDate`) + `findActivityCalendar` (30 dias), monta response com `activityCalendar`
- [x] 3.3 Garantir que ambos os use cases retornam valores zerados (não 404) quando `UserProgress` não existe para o usuário

## 4. Controller — Progress e Streak

- [x] 4.1 Criar `ProgressController` em `apps/api/src/learning/controllers/progress.controller.ts` com:
  - `GET /progress` → `GetProgressUseCase`
  - `GET /streak` → `GetStreakUseCase`
  - `@ApiTags('progress')`, `@ApiBearerAuth()`, `@UseGuards(JwtAuthGuard)`, `@UseInterceptors(MetricsInterceptor)`
  - Decoradores Swagger completos (`@ApiOkResponse`, `@ApiUnauthorizedResponse`)
- [x] 4.2 Registrar `ProgressController`, `GetProgressUseCase` e `GetStreakUseCase` no `LearningModule`

## 5. Update Daily Goals — Users Module

- [x] 5.1 Criar `UpdateGoalsDto` em `apps/api/src/users/dto/update-goals.dto.ts` com `@IsOptional()`, `@IsInt()`, `@Min()`, `@Max()` para `dailyGoalMinutes` (5–120) e `dailyGoalLessons` (1–20); validador customizado rejeitando body vazio
- [x] 5.2 Criar `UpdateGoalsUseCase` em `apps/api/src/users/use-cases/update-goals.use-case.ts`: busca `UserPreferences` por `userId`, lança `NotFoundException` se não existir, aplica PATCH parcial, retorna `{ dailyGoalMinutes, dailyGoalLessons, updatedAt }`
- [x] 5.3 Adicionar `PATCH /users/me/goals` no controller de usuários existente, injetando `UpdateGoalsUseCase`
- [x] 5.4 Registrar `UpdateGoalsUseCase` no módulo `users`

## 6. Observabilidade

- [x] 6.1 Adicionar logs estruturados em `GetProgressUseCase` e `GetStreakUseCase`: `{ timestamp, level, service: 'api', trace_id, user_id, tenant_id }` — sem tokens ou senhas
- [x] 6.2 Adicionar logs estruturados em `UpdateGoalsUseCase`
- [x] 6.3 Confirmar que `MetricsInterceptor` já está aplicado em `ProgressController` (latência p50/p95/p99 por endpoint)

## 7. Testes Unitários

- [x] 7.1 Criar `get-progress.use-case.spec.ts`: testar cálculo de `minutesStudied`, `vocabularyLearned`, montagem de `weeklyActivity` e `monthlyActivity`; testar retorno zerado quando `UserProgress` não existe
- [x] 7.2 Criar `get-streak.use-case.spec.ts`: testar montagem de `activityCalendar` com 30 entradas; testar `active: true` para dias com completions; testar retorno zerado quando sem atividade
- [x] 7.3 Criar `update-goals.use-case.spec.ts`: testar PATCH parcial (só `dailyGoalMinutes`, só `dailyGoalLessons`, ambos); testar `NotFoundException` quando sem `UserPreferences`; testar rejeição de body vazio
- [x] 7.4 Criar/atualizar spec de `LearningDomainService` se `computeStreak` tiver ajustes (manter 80% cobertura de regras de negócio)

## 8. Testes de Integração

- [x] 8.1 Criar teste de integração para o fluxo: completar lição → `GET /api/v1/progress` → verificar `totalXP`, `lessonsCompleted`, `weeklyActivity` atualizados
- [x] 8.2 Criar teste de integração para: completar lição → `GET /api/v1/streak` → verificar `currentStreak` incrementado e `activityCalendar` com o dia de hoje `active: true`
- [x] 8.3 Criar teste de integração para `PATCH /api/v1/users/me/goals`: atualizar ambos os campos e verificar persistência

## 9. Critério de Conclusão

- [x] 9.1 Executar `pnpm lint && pnpm typecheck && pnpm test && pnpm build` com sucesso (sem warnings novos)
- [x] 9.2 Verificar documentação Swagger: `GET /api/v1/progress`, `GET /api/v1/streak` e `PATCH /api/v1/users/me/goals` aparecem com exemplos de response corretos
- [x] 9.3 Testar manualmente: completar uma lição via API e verificar que `/progress` e `/streak` refletem os dados atualizados
