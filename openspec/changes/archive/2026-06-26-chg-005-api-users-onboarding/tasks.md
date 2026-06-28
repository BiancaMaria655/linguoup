## 1. Schema Prisma

- [x] 1.1 Verificar se `UserPreferences` existe no schema Prisma (`packages/database/prisma/schema.prisma`)
- [x] 1.2 Adicionar model `UserPreferences` ao schema com campos: `id`, `userId` (unique), `learningGoal`, `targetLanguage`, `dailyGoalMinutes`, `preferredStudyTime?`, `onboardingCompleted`, `createdAt`, `updatedAt`
- [x] 1.3 Adicionar relação `UserPreferences` ao model `User` no schema
- [x] 1.4 Solicitar aprovação e gerar migration: `pnpm db:migrate:dev --name add-user-preferences`
- [x] 1.5 Documentar rollback: `DROP TABLE user_preferences;` + reverter relação em `User`

> **Rollback**: Se necessário reverter, remover a migration gerada e executar:
> ```sql
> ALTER TABLE "UserPreferences" DROP COLUMN "onboardingCompleted";
> ALTER TABLE "UserPreferences" DROP COLUMN "createdAt";
> ALTER TABLE "UserPreferences" DROP COLUMN "updatedAt";
> ALTER TABLE "UserPreferences" ALTER COLUMN "preferredStudyTime" SET NOT NULL;
> ```
> Ou, se a tabela foi criada do zero neste CHG: `DROP TABLE "UserPreferences";` + reverter relação no model `User`.

## 2. Estrutura do Módulo Users

- [x] 2.1 Criar estrutura de diretórios em `apps/api/src/users/`: `dto/`, `domain/`, `use-cases/`, `repositories/`, `interfaces/`
- [x] 2.2 Criar `users.module.ts` importando `JwtAuthGuard` do `AuthModule` e configurando providers
- [x] 2.3 Criar `users.controller.ts` com rotas base e decorators `@UseGuards(JwtAuthGuard)` e `@ApiBearerAuth()`
- [x] 2.4 Exportar `UserRepository` via `AuthModule` (ou mover para `DatabaseModule`) para uso em `UsersModule`
- [x] 2.5 Registrar `UsersModule` no `AppModule`

## 3. Repository

- [x] 3.1 Criar (ou estender) `UserRepository` com métodos: `findById(userId)`, `updateProfile(userId, data)`, `upsertPreferences(userId, data)`, `findPreferencesByUserId(userId)`
- [x] 3.2 Garantir que todas as queries Prisma filtram por `userId` (nunca expõem dados de outro usuário)

## 4. DTOs e Interfaces

- [x] 4.1 Criar `update-profile.dto.ts`: `name?: string` com validações `@IsOptional()`, `@IsString()`, `@MinLength(2)`, `@MaxLength(100)`
- [x] 4.2 Criar `save-onboarding.dto.ts`: `learningGoal`, `targetLanguage`, `dailyGoalMinutes`, `preferredStudyTime?` com validações completas (`@IsEnum`, `@IsInt`, `@Min(5)`, `@Max(120)`)
- [x] 4.3 Criar enums: `LearningGoal` (`TRAVEL | CAREER | CULTURE | EXAM`) e `PreferredStudyTime` (`MORNING | AFTERNOON | EVENING`)
- [x] 4.4 Criar interface `IUserProfile` e `IInitialPlan` para tipagem de responses

## 5. Domain Service

- [x] 5.1 Criar `user.domain-service.ts` com método `calculateInitialPlan(dailyGoalMinutes: number, targetLanguage: string): IInitialPlan`
- [x] 5.2 Implementar regra: `≤10 min → BASIC/1 lição`, `11–20 min → INTERMEDIATE/2 lições`, `>20 min → INTENSIVE/3 lições`; `weeklyGoal = dailyLessons × 5`

## 6. Use Cases

- [x] 6.1 Criar `get-user-profile.use-case.ts`: busca `User` + `UserPreferences` por `userId`; valida `tenant_id`; retorna perfil formatado
- [x] 6.2 Criar `update-profile.use-case.ts`: valida `userId` + `tenant_id`; atualiza `name` via repository; retorna perfil atualizado
- [x] 6.3 Criar `save-onboarding.use-case.ts`: valida campos via DTO; faz upsert de `UserPreferences` via repository (transação Prisma); emite log estruturado com `user_id`, `tenant_id`, `trace_id`
- [x] 6.4 Criar `get-initial-plan.use-case.ts`: busca `UserPreferences`; retorna erro 422 se `onboardingCompleted = false`; delega cálculo ao `UserDomainService`

## 7. Controller — Endpoints

- [x] 7.1 Implementar `GET /api/v1/users/me` → `GetUserProfileUseCase`; decorators `@ApiOkResponse`, `@ApiUnauthorizedResponse`
- [x] 7.2 Implementar `PATCH /api/v1/users/me` → `UpdateProfileUseCase`; body `UpdateProfileDto`; decorators Swagger completos
- [x] 7.3 Implementar `POST /api/v1/users/me/onboarding` → `SaveOnboardingUseCase`; body `SaveOnboardingDto`; decorators Swagger completos
- [x] 7.4 Implementar `GET /api/v1/users/me/onboarding/plan` → `GetInitialPlanUseCase`; decorators `@ApiOkResponse`, `@ApiUnprocessableEntityResponse`

## 8. Testes Unitários

- [x] 8.1 Testar `UserDomainService.calculateInitialPlan`: cenários BASIC (≤10), INTERMEDIATE (11–20), INTENSIVE (>20)
- [x] 8.2 Testar `SaveOnboardingUseCase`: sucesso (primeira vez), idempotência (segunda chamada), campos inválidos
- [x] 8.3 Testar `GetInitialPlanUseCase`: retorno correto, erro 422 quando `onboardingCompleted = false`
- [x] 8.4 Testar `GetUserProfileUseCase`: perfil com preferências, perfil sem preferências (`null`)
- [x] 8.5 Testar `UpdateProfileUseCase`: atualização com nome válido, rejeição com nome inválido

## 9. Testes de Integração

- [x] 9.1 Testar fluxo completo: login (obter JWT) → `GET /me` → `POST /onboarding` → `GET /onboarding/plan`
- [x] 9.2 Testar que usuário A não acessa dados do usuário B (isolamento por `userId`)
- [x] 9.3 Testar idempotência do `POST /onboarding` (duas chamadas consecutivas com dados diferentes)
- [x] 9.4 Testar `PATCH /me` com nome válido e com nome abaixo do mínimo (400)

## 10. Observabilidade e Critério de Conclusão

- [x] 10.1 Garantir que `SaveOnboardingUseCase` emite log estruturado com `user_id`, `tenant_id`, `trace_id`, `level: "info"`
- [x] 10.2 Verificar que nenhum log contém tokens, senhas ou dados sensíveis
- [x] 10.3 Adicionar decoradores OpenAPI em todos os endpoints (`@ApiTags('users')`, `@ApiBearerAuth()`, responses documentadas)
- [x] 10.4 Executar critério de conclusão: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`
