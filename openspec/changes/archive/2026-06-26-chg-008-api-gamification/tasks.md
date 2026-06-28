## 1. Prisma Schema & Migration

- [x] 1.1 Adicionar `@@unique([userId, achievementId])` ao model `UserAchievement` no schema Prisma (solicitar aprovação antes de rodar `pnpm db:migrate:dev`)
- [x] 1.2 Criar e revisar migration `add_unique_user_achievement` — documentar rollback: `ALTER TABLE "UserAchievement" DROP CONSTRAINT "UserAchievement_userId_achievementId_key"`
- [x] 1.3 Aplicar migration em dev: `pnpm db:migrate:dev` (requer aprovação prévia)

## 2. Seed de Conquistas

- [x] 2.1 Adicionar seed das 10 conquistas pré-definidas em `packages/database/prisma/seed.ts` usando `createMany` com `skipDuplicates: true`
- [x] 2.2 Verificar que `pnpm db:seed` executa sem erros e registra exatamente 10 conquistas

## 3. GamificationModule — Estrutura

- [x] 3.1 Criar estrutura de diretórios em `apps/api/src/gamification/`: `controllers/`, `use-cases/`, `services/`, `repositories/`, `dto/`
- [x] 3.2 Criar `GamificationModule` (`gamification.module.ts`) importando `DatabaseModule` e exportando `AchievementUnlockService`
- [x] 3.3 Registrar `GamificationModule` em `AppModule`

## 4. AchievementUnlockService (Domain Service)

- [x] 4.1 Criar `AchievementUnlockService` em `gamification/services/` com método `evaluate({ userId, tenantId, totalXP, currentStreakDays, lessonsCompleted })`
- [x] 4.2 Implementar lógica de avaliação dos 10 critérios MVP usando `Achievement.criteria` JSON
- [x] 4.3 Implementar desbloqueio idempotente via `prisma.userAchievement.createMany({ skipDuplicates: true })`
- [x] 4.4 Retornar array de `{ id, name, iconUrl }` das conquistas recém-desbloqueadas

## 5. Testes Unitários — AchievementUnlockService

- [x] 5.1 Criar `achievement-unlock.service.spec.ts` com mocks do Prisma
- [x] 5.2 Testar critério `lessons_completed`: primeira lição, 10 lições, 25 lições
- [x] 5.3 Testar critério `streak_days`: 3 dias, 7 dias
- [x] 5.4 Testar critério `total_xp`: 100 XP, 500 XP
- [x] 5.5 Testar idempotência: chamar `evaluate()` duas vezes com mesmo estado não duplica conquistas
- [x] 5.6 Testar múltiplos desbloqueios simultâneos (atingir limiar de XP e lições ao mesmo tempo)

## 6. GamificationRepository

- [x] 6.1 Criar `GamificationRepository` em `gamification/repositories/` com métodos:
  - `findAllAchievements()` — busca catálogo completo do banco
  - `findUserAchievements(userId, tenantId)` — busca conquistas do usuário com join em `Achievement`
  - `findUserLessonsCompleted(userId)` — conta `LessonCompletion` por usuário

## 7. Use Cases de Gamificação

- [x] 7.1 Criar `GetXpUseCase` em `gamification/use-cases/`: lê `UserProgress.totalXP` e deriva histórico de `LessonCompletion` ordenado por `completedAt` DESC
- [x] 7.2 Criar `GetAchievementsUseCase`: lê catálogo via `GamificationRepository`, aplica cache Redis (TTL 1h, Cache-aside)
- [x] 7.3 Criar `GetMyAchievementsUseCase`: lê `UserAchievement` do usuário com join em `Achievement`, ordena por `unlockedAt` ASC

## 8. GamificationController

- [x] 8.1 Criar `GamificationController` em `gamification/controllers/` com:
  - `GET /api/v1/xp` → `GetXpUseCase`
  - `GET /api/v1/achievements` → `GetAchievementsUseCase`
  - `GET /api/v1/achievements/me` → `GetMyAchievementsUseCase`
- [x] 8.2 Aplicar `@UseGuards(AuthGuard)` e extrair `userId`, `tenantId`, `traceId` do JWT em todos os endpoints
- [x] 8.3 Criar DTOs de response (`XpResponseDto`, `AchievementDto`, `UserAchievementDto`) com decorators OpenAPI (`@ApiProperty`)

## 9. Integração com CompleteLessonUseCase

- [x] 9.1 Injetar `AchievementUnlockService` no `CompleteLessonUseCase`
- [x] 9.2 Após o commit da transação Prisma, chamar `AchievementUnlockService.evaluate()` com `{ userId, tenantId, totalXP: result.newTotalXP, currentStreakDays: result.streakDays, lessonsCompleted }`
- [x] 9.3 Atualizar `CompleteLessonResult` interface para incluir `newAchievements: { id: string; name: string; iconUrl: string }[]`
- [x] 9.4 Atualizar `LearningController` para incluir `newAchievements` na resposta de `POST /api/v1/lessons/{id}/complete`
- [x] 9.5 Atualizar OpenAPI/Swagger do endpoint `POST /api/v1/lessons/{id}/complete` para refletir o novo campo

## 10. Testes Unitários — Use Cases e Controller

- [x] 10.1 Criar `get-xp.use-case.spec.ts`: testar retorno de `total: 0, history: []` para novo usuário; testar ordenação do histórico
- [x] 10.2 Criar `get-achievements.use-case.spec.ts`: testar que catálogo é servido do cache na segunda chamada
- [x] 10.3 Criar `get-my-achievements.use-case.spec.ts`: testar lista vazia e lista com conquistas
- [x] 10.4 Atualizar `complete-lesson.use-case.spec.ts` para verificar que `newAchievements` é retornado corretamente

## 11. Testes de Integração

- [x] 11.1 Criar teste de integração: completar lição → verificar que `newAchievements` retorna conquistas desbloqueadas
- [x] 11.2 Testar idempotência via integração: completar mesma lição duas vezes → sem duplicata em `UserAchievement`
- [x] 11.3 Testar `GET /api/v1/xp` após completar 3 lições: verificar `total` correto e `history` com 3 entradas

## 12. Testes E2E

- [x] 12.1 Criar `gamification.e2e-spec.ts`: jornada completa — completar primeira lição → verificar conquista "Primeira Lição" desbloqueada via `GET /api/v1/achievements/me`
- [x] 12.2 Testar acesso não autenticado a `GET /api/v1/xp`, `GET /api/v1/achievements` e `GET /api/v1/achievements/me` retorna 401

## 13. Observabilidade

- [x] 13.1 Adicionar logs estruturados em `GetXpUseCase`, `GetAchievementsUseCase`, `GetMyAchievementsUseCase` com `timestamp`, `level`, `service`, `trace_id`, `user_id`, `tenant_id`
- [x] 13.2 Adicionar log em `AchievementUnlockService` registrando conquistas desbloqueadas (sem dados sensíveis)

## 14. Critério de Conclusão

- [x] 14.1 Executar `pnpm lint && pnpm typecheck && pnpm test && pnpm build` — todos devem passar sem erros
