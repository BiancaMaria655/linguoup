## Context

O CHG-006 implementa o Learning Domain — núcleo funcional do LinguoUp. Depende do CHG-004 (autenticação JWT) e CHG-005 (users/onboarding com `UserProgress` e `UserPreferences`). O schema Prisma já contém os modelos `Lesson`, `LessonCompletion` e `UserProgress`. A operação de conclusão de lição é a mais crítica do sistema: deve ser atômica (conclusão + XP + streak em uma única transação Prisma).

Dois desafios principais:
1. **Atomicidade**: conclusão de lição envolve três writes (LessonCompletion, UserProgress.totalXP, UserProgress.streak) que devem ser rollback-safe.
2. **Cache**: catálogo de lições é read-heavy; o banco não deve ser acessado em toda requisição de listagem.

## Goals / Non-Goals

**Goals:**
- Expor os 5 endpoints do catálogo de lições e avaliação de nível via API REST.
- Garantir atomicidade na conclusão de lição via `prisma.$transaction`.
- Implementar cache Redis (Cache-aside, TTL 1h) no catálogo de lições.
- Seguir Clean Architecture: Controller → Use Case → Domain Service → Repository.
- Cobertura mínima de testes: unitários para use cases e domain services, integração para o fluxo de conclusão.

**Non-Goals:**
- Motor de repetição espaçada (CHG-009).
- CRUD de lições pelo painel admin (CHG-013).
- Avaliação por IA/conversacional (V3).
- Conteúdo offline (V2).

## Decisions

### 1. Transação atômica com `prisma.$transaction` (interactive)

**Decisão**: Usar `prisma.$transaction(async (tx) => { ... })` (modo interativo) em vez do batch array.

**Rationale**: O modo interativo permite lógica condicional dentro da transação (ex: calcular XP com base no score, verificar se streak deve ser incrementado ou resetado com base em `lastActivityDate`). O batch array não suporta condicional.

**Alternativas consideradas**:
- Batch array `$transaction([...])`: mais simples, mas sem lógica condicional.
- Evento de domínio + saga: complexidade desnecessária no MVP.

### 2. Cache-aside no Redis para catálogo de lições

**Decisão**: Cache-aside manual no `LessonRepository`, chave `lessons:catalog:{hash(filters)}`, TTL 1h.

**Rationale**: O catálogo muda raramente (somente via admin). Cache-aside dá controle explícito de invalidação. O padrão já está no projeto (Redis configurado no `AppModule`).

**Alternativas consideradas**:
- Cache de nível HTTP (CDN/CloudFront): não aplicável para endpoint autenticado por Bearer.
- NestJS `CacheInterceptor`: menos controle sobre chave e invalidação granular.

### 3. Paginação cursor-based no catálogo

**Decisão**: Paginação via `cursor` (UUID da última lição retornada) em vez de offset.

**Rationale**: Offset é instável com writes concorrentes. Cursor é determinístico e performático com índice. Alinhado com o contrato OpenAPI da proposal.

### 4. Avaliação de nível como serviço de domínio stateless

**Decisão**: `AssessmentEvaluationService` recebe respostas, calcula nível internamente e retorna o resultado. As perguntas de avaliação são seed data no banco (não geradas em runtime).

**Rationale**: Simplifica o MVP. Evita dependência de IA no V1. Perguntas são curadas manualmente via `pnpm db:seed`.

### 5. Estrutura de módulo NestJS

**Decisão**: Criar `LearningModule` em `apps/api/src/learning/` com os seguintes arquivos:
```
learning/
  learning.module.ts
  controllers/lessons.controller.ts
  use-cases/
    list-lessons.use-case.ts
    get-lesson.use-case.ts
    complete-lesson.use-case.ts
    get-assessment.use-case.ts
    submit-assessment.use-case.ts
  services/
    learning-domain.service.ts
    assessment-evaluation.service.ts
  repositories/
    lesson.repository.ts
    progress.repository.ts
  dto/
    complete-lesson.dto.ts
    submit-assessment.dto.ts
    lesson-response.dto.ts
```

**Rationale**: Segue o mesmo padrão de `UsersModule` (CHG-005), garantindo consistência no monorepo.

## Risks / Trade-offs

| Risco | Mitigação |
|-------|-----------|
| Transação falha parcialmente (ex: Redis fora do ar após commit Prisma) | Redis é cache, não fonte de verdade. Falha de cache não aborta transação. Log de erro + métrica Sentry sem rollback do DB. |
| Contenda em `UserProgress` (múltiplos requests simultâneos de um mesmo usuário) | `prisma.$transaction` com `isolationLevel: Serializable` no `updateUserProgress`. Aceita-se pequena latência extra por segurança de dados. |
| Perguntas de avaliação sem modelo dedicado | As perguntas ficam em `Lesson.content` (JSON) com `theme: "assessment"`. Flexível para MVP, pode ser extraído em V2. |
| `timeSpentSeconds` não validado pelo servidor | DTO com `@IsInt()` e `@Min(1)`. Aceita valor informado pelo cliente (confiável no MVP; auditoria em V2). |

## Migration Plan

1. Nenhuma migration nova necessária: `Lesson`, `LessonCompletion`, `UserProgress` já existem no schema.
2. Seed de lições de avaliação: `pnpm db:seed` popula `Lesson` com `theme: "assessment"` e `content` estruturado.
3. Deploy incremental: endpoints novos em `/api/v1/lessons/*`. Sem breaking changes em contratos existentes.
4. Rollback: remover rotas do módulo sem impacto no banco (dados permanecem).

## Open Questions

- **Cálculo de XP**: A fórmula `xpEarned = baseXP * (score / 100)` está definida na proposal? Confirmar se é linear ou tem bônus por streak.
- **Seed de lições**: Quantas lições de avaliação serão criadas no seed? Mínimo 10 perguntas conforme proposal.
- **Invalidação de cache**: Admin ainda não existe (CHG-013). Cache expira apenas por TTL no MVP — confirmar se isso é aceitável.
