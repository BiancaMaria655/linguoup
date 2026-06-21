# CHG-006 — API: Lições & Trilhas (Learning Domain)

## Versão do Roadmap
**V1 — MVP**

## Descrição
Implementação do domínio de aprendizado no backend NestJS: catálogo de lições, trilhas de aprendizado, avaliação de nível inicial, e registro de conclusão de lição com atualização atômica de XP e streak. Este é o núcleo funcional do produto.

## Contexto
Dependências: CHG-004 (auth), CHG-005 (users). A conclusão de lição é a operação mais crítica do sistema — deve ser atômica (conclusão + XP + streak em uma transação Prisma). Cache de catálogo de lições no Redis (TTL: 1h). Fluxo: `LessonsController → CompleteLessonUseCase → LearningDomainService → {LessonRepository, ProgressRepository} → Prisma ($transaction)`.

## Escopo

### O que está incluído

**Endpoints protegidos:**
- `GET /api/v1/lessons` — catálogo de lições (filtros: level, theme; paginação cursor-based; cache Redis 1h)
- `GET /api/v1/lessons/{id}` — detalhe de uma lição (conteúdo completo, exercícios)
- `POST /api/v1/lessons/{id}/complete` — registrar conclusão (transação atômica: cria `LessonCompletion` + atualiza `UserProgress.totalXP` + atualiza streak)
- `GET /api/v1/lessons/assessment` — avaliação de nível: retorna conjunto de perguntas (10 min max)
- `POST /api/v1/lessons/assessment/submit` — submeter respostas da avaliação → retorna nível identificado

**Transação atômica em `CompleteLessonUseCase`:**
```
prisma.$transaction([
  createLessonCompletion(userId, lessonId, score, xpEarned),
  updateUserProgress(userId, xpEarned),
  updateStreak(userId, today),
])
```

**Cache:**
- Catálogo de lições: Redis Cache-aside, TTL 1h
- Invalidação ao criar/atualizar lição (via admin)

**Testes:**
- Unitários: `CompleteLessonUseCase` (mock de Prisma), `AssessmentEvaluationService`
- Integração: fluxo completo de completar lição → verificar XP e streak atualizados
- E2E: jornada "iniciar lição → completar → ver resultado"

### Non-goals
- Motor de repetição espaçada (CHG-009)
- Conteúdo offline (V2)
- Criação de lições pelo admin (CHG-013)
- Avaliação de fala ou IA conversacional (V3)

## Endpoints OpenAPI

```yaml
GET /api/v1/lessons:
  auth: Bearer
  query: { level?, theme?, cursor?, limit? }
  response: { data: [Lesson], metadata: { cursor, total } }

GET /api/v1/lessons/{id}:
  auth: Bearer
  response: { data: Lesson }

POST /api/v1/lessons/{id}/complete:
  auth: Bearer
  request: { score, timeSpentSeconds }
  response: { data: { xpEarned, newTotalXP, streakUpdated, streakDays } }

GET /api/v1/lessons/assessment:
  auth: Bearer
  response: { data: { questions: [Question], estimatedMinutes: 10 } }

POST /api/v1/lessons/assessment/submit:
  auth: Bearer
  request: { answers: [{ questionId, answer }] }
  response: { data: { level, description, recommendedTrack } }
```

## Tamanho, Complexidade e Risco
| Dimensão    | Avaliação | Justificativa |
|-------------|-----------|---------------|
| Tamanho     | Médio     | 5 endpoints + transação atômica + cache |
| Complexidade| Média     | Transação Prisma multi-entidade + cache Redis + avaliação |
| Risco       | Médio     | Transação atômica é crítica; testes de integração obrigatórios |

## Plano de Verificação
```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
# Simular falha em meio à transação e verificar rollback
# Verificar que XP e streak são atualizados corretamente após conclusão
# Verificar cache Redis: 2ª chamada GET /lessons não vai ao banco
```
