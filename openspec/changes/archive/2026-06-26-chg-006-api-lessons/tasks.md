## 1. Scaffolding do LearningModule

- [x] 1.1 Criar estrutura de diretórios `apps/api/src/learning/` com subpastas `controllers/`, `use-cases/`, `services/`, `repositories/`, `dto/`
- [x] 1.2 Criar `LearningModule` (`learning.module.ts`) com imports de `PrismaModule` e `RedisModule`
- [x] 1.3 Registrar `LearningModule` no `AppModule`

## 2. DTOs e Contratos de API

- [x] 2.1 Criar `ListLessonsQueryDto` com campos opcionais `level`, `theme`, `cursor`, `limit` (com `@IsOptional`, `@IsString`, `@IsUUID`, `@IsInt`, `@Min(1)`)
- [x] 2.2 Criar `CompleteLessonDto` com `score: number` (0–100) e `timeSpentSeconds: number` (≥1) com validadores class-validator
- [x] 2.3 Criar `SubmitAssessmentDto` com `answers: { questionId: string, answer: string }[]` e `@ArrayNotEmpty()`
- [x] 2.4 Criar `LessonResponseDto`, `LessonDetailResponseDto`, `CompleteLessonResponseDto`, `AssessmentResultDto` com decorators Swagger (`@ApiProperty`)

## 3. Repositories

- [x] 3.1 Criar `LessonRepository` com método `findAll({ level?, theme?, cursor?, limit?, tenantId })` usando Prisma + cache Redis (Cache-aside, TTL 1h, chave `lessons:catalog:{hash}`)
- [x] 3.2 Implementar `findById(id, tenantId)` no `LessonRepository` validando `tenant_id`
- [x] 3.3 Implementar `findAssessmentQuestions(tenantId)` no `LessonRepository` (filtra `theme: 'assessment'`)
- [x] 3.4 Criar `ProgressRepository` com método `upsertProgress(tx, userId, tenantId, xpEarned)` e `updateStreak(tx, userId, today)`
- [x] 3.5 Implementar `createLessonCompletion(tx, data)` no `ProgressRepository`

## 4. Domain Services

- [x] 4.1 Criar `LearningDomainService` com método `calculateXp(score: number, baseXp: number): number` (fórmula linear: `Math.round(baseXp * score / 100)`)
- [x] 4.2 Criar `AssessmentEvaluationService` com método `evaluate(questions, answers): { level, description, recommendedTrack }` (calcula acertos e mapeia para nível A1–C2)
- [x] 4.3 Implementar lógica de streak em `LearningDomainService.computeStreak(lastActivityDate, currentStreakDays, today)` → retorna `{ newStreakDays, streakUpdated }`

## 5. Use Cases

- [x] 5.1 Criar `ListLessonsUseCase` que chama `LessonRepository.findAll()` com filtros e retorna `{ data, metadata }`
- [x] 5.2 Criar `GetLessonUseCase` que chama `LessonRepository.findById()`, lança `NotFoundException` se não encontrar
- [x] 5.3 Criar `CompleteLessonUseCase` com `prisma.$transaction(async (tx) => { createLessonCompletion + upsertProgress + updateStreak })` — usa `LearningDomainService.calculateXp` e `computeStreak`
- [x] 5.4 Criar `GetAssessmentUseCase` que chama `LessonRepository.findAssessmentQuestions()` e retorna `{ questions, estimatedMinutes: 10 }`
- [x] 5.5 Criar `SubmitAssessmentUseCase` que chama `AssessmentEvaluationService.evaluate()` e retorna nível identificado

## 6. Controller

- [x] 6.1 Criar `LessonsController` com decorators `@ApiTags('lessons')`, `@ApiBearerAuth()`, `@UseGuards(JwtAuthGuard)`
- [x] 6.2 Implementar `GET /lessons` → `ListLessonsUseCase` com `@Query() query: ListLessonsQueryDto`
- [x] 6.3 Implementar `GET /lessons/assessment` → `GetAssessmentUseCase` (rota deve vir ANTES de `GET /lessons/:id`)
- [x] 6.4 Implementar `GET /lessons/:id` → `GetLessonUseCase`
- [x] 6.5 Implementar `POST /lessons/:id/complete` → `CompleteLessonUseCase` com `@Body() dto: CompleteLessonDto`
- [x] 6.6 Implementar `POST /lessons/assessment/submit` → `SubmitAssessmentUseCase` com `@Body() dto: SubmitAssessmentDto`

## 7. Observabilidade

- [x] 7.1 Adicionar logs estruturados (`timestamp`, `level`, `service`, `trace_id`, `user_id`, `tenant_id`) em todos os use cases via `Logger` do NestJS
- [x] 7.2 Registrar métricas de latência (p50/p95/p99) via OpenTelemetry no controller (interceptor existente ou novo `MetricsInterceptor`)
- [x] 7.3 Configurar Sentry error reporting no `CompleteLessonUseCase` (captura exceção sem logar dados sensíveis)

## 8. Seed de Dados

- [x] 8.1 Criar seed de lições de avaliação: ao menos 10 lições com `theme: 'assessment'` e `content: { type: 'question', options: [...] }` no `packages/database/prisma/seed.ts`
- [x] 8.2 Verificar que `pnpm db:seed` executa sem erros e popula as lições de avaliação no banco local

## 9. Testes Unitários

- [x] 9.1 Teste unitário de `CompleteLessonUseCase`: mock de Prisma, cenários de sucesso, rollback e streak
- [x] 9.2 Teste unitário de `AssessmentEvaluationService.evaluate()`: todos os níveis (A1–C2) com respostas corretas e incorretas
- [x] 9.3 Teste unitário de `LearningDomainService.calculateXp()` e `computeStreak()` com boundary conditions (score=0, score=100, streak reset)
- [x] 9.4 Teste unitário de `ListLessonsUseCase`: mock do cache Redis (hit e miss)

## 10. Testes de Integração

- [x] 10.1 Teste de integração: fluxo completo `POST /lessons/{id}/complete` → verificar `LessonCompletion` criada + `UserProgress.totalXP` atualizado + streak correto
- [x] 10.2 Teste de integração: verificar rollback da transação quando há falha simulada no meio
- [x] 10.3 Teste de integração: `GET /lessons` com cache Redis — 2ª chamada não acessa o banco (spy em `PrismaService`)

## 11. Critério de Conclusão

- [x] 11.1 Executar `pnpm lint && pnpm typecheck && pnpm test && pnpm build` com sucesso
- [x] 11.2 Verificar Swagger em `GET /api/docs` — todos os 5 endpoints documentados com schemas corretos
- [x] 11.3 Simular falha em meio à transação de conclusão de lição e verificar rollback no banco local
