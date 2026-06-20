# CHG-003 — Schema de Banco de Dados & Prisma Setup

## Versão do Roadmap
**V1 — MVP**

## Descrição
Configuração do Prisma ORM no package `packages/database`, definição do schema inicial do banco de dados com todas as entidades do MVP, e execução das primeiras migrations. Esta mudança estabelece a fonte de verdade transacional do sistema.

## Contexto
Dependência: CHG-001 (monorepo setup). O schema deve contemplar isolamento lógico por `tenant_id` em todas as entidades principais, conforme requisito arquitetural. Os domínios cobertos são: `users`, `lessons`, `progress`, `streak`, `achievements`, `xp`, `notifications`.

## Escopo

### O que está incluído

**`packages/database/prisma/schema.prisma`** com as entidades:

- `User` (id, tenant_id, email, name, passwordHash, role, createdAt, updatedAt)
- `UserPreferences` (userId, targetLanguage, learningGoal, dailyGoalMinutes, preferredStudyTime)
- `Lesson` (id, tenant_id, title, description, level, theme, durationMinutes, content JSON, createdAt)
- `LessonCompletion` (id, userId, lessonId, completedAt, score, xpEarned)
- `UserProgress` (id, userId, tenant_id, totalXP, currentLevel, currentStreakDays, longestStreak, lastActivityDate)
- `Achievement` (id, name, description, iconUrl, xpReward, criteria JSON)
- `UserAchievement` (id, userId, achievementId, unlockedAt)
- `SpacedReviewItem` (id, userId, lessonId, nextReviewAt, easeFactor, interval, repetitions)
- `Notification` (id, userId, type, message, readAt, createdAt)

**Migrations e seeds:**
- Migration inicial com rollback documentado
- Seed com dados de exemplo: 1 usuário, 5 lições, conquistas básicas

### Impacto em tenant_id
Todas as entidades principais (`User`, `Lesson`, `UserProgress`) contêm `tenant_id`. Acessos validam `tenant_id` antes de qualquer operação.

### Non-goals
- Nenhuma API ou lógica de negócio (CHG-004+)
- Nenhuma migração de dados existentes
- Relacionamentos com serviços externos (Auth0, S3)
- Schema de V2+ (repetição espaçada avançada, multilíngue)

## Arquivos Afetados

### [NEW] `packages/database/package.json`
### [NEW] `packages/database/prisma/schema.prisma`
### [NEW] `packages/database/prisma/migrations/0001_initial/migration.sql`
### [NEW] `packages/database/prisma/seed.ts`
### [NEW] `packages/database/src/index.ts` (exporta PrismaClient)
### [MODIFY] `package.json` (raiz) — scripts `db:migrate`, `db:seed`, `db:studio`

## Tamanho, Complexidade e Risco
| Dimensão    | Avaliação | Justificativa |
|-------------|-----------|---------------|
| Tamanho     | Médio     | Schema abrangente mas bem delimitado |
| Complexidade| Média     | Relacionamentos entre entidades + tenant_id |
| Risco       | Médio     | Alterações de schema têm impacto futuro; rollback documentado obrigatório |

## Plano de Verificação
```bash
pnpm db:migrate
pnpm db:seed
pnpm db:studio
# Verificar que todas as tabelas foram criadas com as relações corretas
pnpm lint && pnpm typecheck && pnpm test
```
