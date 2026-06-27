## Context

O domínio de gamificação é a terceira peça do core loop do LinguoUp (lição → XP + streak → conquistas). Os modelos `Achievement` e `UserAchievement` já existem no schema Prisma; o XP já é acumulado em `UserProgress.totalXP`; o contador de lições pode ser derivado de `LessonCompletion`. O sistema foi projetado para MVP com desbloqueio síncrono dentro do fluxo de conclusão de lição.

**Estado atual:**
- `CompleteLessonUseCase` retorna `{ xpEarned, newTotalXP, streakUpdated, streakDays }`.
- Não há módulo de gamificação, nem endpoints para XP ou conquistas.
- O seed de conquistas ainda não existe.

**Dependências:**
- CHG-006 (lições): fonte de XP e `LessonCompletion`.
- CHG-007 (streak): `UserProgress.currentStreakDays` como critério de conquistas de consistência.

## Goals / Non-Goals

**Goals:**
- Expor `GET /api/v1/xp` com total e histórico cronológico de ganhos de XP.
- Expor `GET /api/v1/achievements` com catálogo de todas as conquistas disponíveis.
- Expor `GET /api/v1/achievements/me` com conquistas desbloqueadas pelo usuário.
- Implementar `AchievementUnlockService` com critérios do MVP (primeria lição, streak 3d, streak 7d, 100 XP, 500 XP, 10 lições, 25 lições + níveis Iniciante/Intermediário/Avançado).
- Integrar desbloqueio automático no `CompleteLessonUseCase` (chamado após a transação atômica existente).
- Enriquecer a resposta de `POST /api/v1/lessons/{id}/complete` com `newAchievements`.
- Adicionar seed de 10 conquistas pré-definidas.
- Testes unitários, de integração e E2E cobrindo critérios e idempotência.

**Non-Goals:**
- Rankings, leaderboards, ligas ou torneios (V3).
- XP como moeda virtual.
- Conquistas sociais ou entre usuários.
- Notificações push para conquistas (V2).

## Decisions

### D1: Módulo separado `GamificationModule` vs. extensão de `LearningModule`

**Decisão:** Criar `GamificationModule` separado em `apps/api/src/gamification/`.

**Rationale:** A gamificação tem responsabilidade distinta (XP history, conquistas) e tende a crescer (V2+). Separar agora evita poluir `LearningModule`, que já tem 11 use-cases. O `GamificationModule` exporta `AchievementUnlockService` para ser injetado no `LearningModule`.

**Alternativa considerada:** Adicionar tudo em `LearningModule`. Rejeitado por acoplamento excessivo e violação de SRP.

---

### D2: Desbloqueio síncrono vs. assíncrono via event bus

**Decisão:** MVP usa desbloqueio síncrono — `AchievementUnlockService.evaluate()` é chamado dentro de `CompleteLessonUseCase` **após** a transação Prisma, não dentro dela.

**Rationale:** Mantém simplicidade e a latência adicional é desprezível (query de conquistas já desbloqueadas + INSERT condicional). Evita introduzir um event bus (BullMQ/NestJS EventEmitter) sem necessidade atual.

**Trade-off:** Se a lista de conquistas crescer muito (V3), o desbloqueio síncrono pode adicionar latência perceptível. A migração para eventos é trivial: trocar chamada direta por `EventEmitter2.emit('lesson.completed', payload)`.

---

### D3: Idempotência no desbloqueio de conquistas

**Decisão:** Usar `upsert` do Prisma com constraint única `(userId, achievementId)` para garantir que a mesma conquista não seja registrada duas vezes.

**Rationale:** Protege contra double-submit e retries. O `UserAchievement` não tem unique constraint hoje — a migration deve adicionar `@@unique([userId, achievementId])`.

---

### D4: Critérios de conquistas como dados vs. código

**Decisão:** Critérios armazenados no campo `Achievement.criteria` (JSON) mas **avaliados em código** dentro de `AchievementUnlockService`.

**Rationale:** Para o MVP, os critérios são fixos e conhecidos. Avaliação em código é tipada, testável e simples. O campo JSON permite exibir a descrição do critério no frontend sem lógica adicional.

---

### D5: Posicionamento de `XP History` — tabela nova vs. derivada de `LessonCompletion`

**Decisão:** Derivar XP history diretamente de `LessonCompletion` (campos `xpEarned`, `completedAt`, `lessonId`). Sem nova tabela.

**Rationale:** `LessonCompletion` já registra `xpEarned` por lição. Criar uma tabela separada seria duplicação de dados. Se fontes de XP além de lições forem adicionadas (V2), a tabela é criada então.

## Risks / Trade-offs

| Risco | Mitigação |
|-------|-----------|
| Migration com `@@unique([userId, achievementId])` pode falhar se existirem duplicatas no banco de dev | Limpar dados de dev antes de rodar a migration (`pnpm db:migrate:dev`) |
| `AchievementUnlockService` chamado fora da transação de lição → conquista desbloqueada sem XP em falha de rede | Risco aceitável no MVP; conquistas são append-only e o XP já foi commitado. Em falha extrema, o usuário completa a lição novamente (idempotência cobre isso) |
| Resposta de `POST /api/v1/lessons/{id}/complete` com campo novo `newAchievements` pode ser interpretada como breaking change | Adição de campo novo em JSON é backwards-compatible (non-breaking). Contrato expandido, não modificado |
| Seed de conquistas re-executado em ambiente limpo pode duplicar dados | Seed deve usar `upsert` (`createMany` com `skipDuplicates: true`) |

## Migration Plan

1. Adicionar migration Prisma: `@@unique([userId, achievementId])` em `UserAchievement`. (**Requer aprovação — `pnpm db:migrate:dev`**)
2. Criar seed de conquistas em `packages/database/prisma/seed.ts`.
3. Implementar `GamificationModule` (controllers, use-cases, service, repository).
4. Exportar `AchievementUnlockService` do `GamificationModule`; importar no `LearningModule`.
5. Atualizar `CompleteLessonUseCase` para chamar `AchievementUnlockService.evaluate()` e retornar `newAchievements`.
6. Testes unitários, integração e E2E.
7. Executar: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.

**Rollback:** Reverter migration Prisma. Os endpoints novos podem ser removidos sem afetar endpoints existentes.

## Open Questions

1. **Critério "Avançado":** qual nível de XP ou lições define a conquista "Avançado"? (Proposta: 500 XP ou 25 lições — conforme proposal.)
2. **`iconUrl` no seed:** usar URLs de placeholder (e.g., `/icons/achievements/first-lesson.svg`) ou referência a S3? (Proposta MVP: paths relativos — substituídos no deploy.)
3. **Aprovação de migration:** confirmar com o time antes de criar `pnpm db:migrate:dev` para `@@unique([userId, achievementId])`.
