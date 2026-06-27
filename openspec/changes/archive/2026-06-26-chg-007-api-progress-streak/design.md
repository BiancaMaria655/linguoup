## Context

O módulo `learning` (CHG-006) já implementa a persistência atômica de progresso e streak como parte da transação de conclusão de lição (`CompleteLessonUseCase`). Os modelos `UserProgress` e `LessonCompletion` existem no schema Prisma e o `ProgressRepository` já expõe `findProgressByUserId`. O `LearningDomainService` já implementa `computeStreak`.

Esta mudança **não cria nova infraestrutura** — expõe os dados já persistidos como endpoints de leitura, e adiciona o endpoint de atualização de meta diária no módulo `users`.

**Estado atual:**
- `UserProgress`: armazena `totalXP`, `currentLevel`, `currentStreakDays`, `longestStreak`, `lastActivityDate`
- `LessonCompletion`: armazena `completedAt`, `score`, `xpEarned` por lição
- `UserPreferences`: armazena `dailyGoalMinutes` (mas não `dailyGoalLessons`)
- Não existe `minutesStudied` acumulado no schema — será calculado on-the-fly via `SUM(lesson.durationMinutes)` nas completions

## Goals / Non-Goals

**Goals:**
- Expor `GET /api/v1/progress` com dados de progresso geral do usuário autenticado
- Expor `GET /api/v1/streak` com dados de streak atual e calendário de atividade (30 dias)
- Expor `PATCH /api/v1/users/me/goals` para atualizar meta diária
- Reaproveitar o `ProgressRepository` existente, estendendo-o com queries de leitura
- Cobrir com testes unitários e de integração conforme pirâmide definida no AGENTS.md

**Non-Goals:**
- Criar novo módulo NestJS separado (mantém coesão com `learning`)
- Alterar schema Prisma para adicionar `minutesStudied` (calculado on-the-fly — suficiente para MVP)
- Implementar cache Redis para as respostas (V2, quando houver carga real)
- Ranking entre usuários, analytics avançado, exportação de dados

## Decisions

### 1. Onde colocar os novos endpoints?

**Decisão:** `GET /progress` e `GET /streak` ficam em um novo `ProgressController` dentro do módulo `learning`. O `PATCH /users/me/goals` fica no módulo `users`.

**Alternativa considerada:** Criar um módulo `progress` separado.

**Rationale:** Os dados de progresso são gerados pelo `LearningModule` e já usam os mesmos repositories. Criar um módulo separado implicaria compartilhar `ProgressRepository` via exports ou duplicação. Para MVP, colocar `ProgressController` dentro de `LearningModule` é a solução com menor acoplamento e menor código novo. O endpoint de goals vai para `users` pois atualiza `UserPreferences`, que pertence a esse domínio.

---

### 2. Como calcular `minutesStudied` e `weeklyActivity`?

**Decisão:** Calcular on-the-fly via queries agregadas no `ProgressRepository` — sem campo acumulado no schema.

**Alternativa considerada:** Adicionar campo `minutesStudied` ao `UserProgress` e incrementar na transação de conclusão.

**Rationale:** Para MVP, a frequência de acesso a `/progress` é baixa. Queries com `GROUP BY` em `LessonCompletion` são simples e o volume de dados por usuário é pequeno. Evitar alteração de schema/migration reduz risco. Se houver problema de performance em V2, adiciona-se o campo acumulado com uma migration simples.

---

### 3. Calendário de atividade (`activityCalendar`): como construir os 30 dias?

**Decisão:** Buscar as `LessonCompletion` dos últimos 30 dias do usuário, agrupar por data, e gerar array de 30 entradas `{ date, active }`.

**Rationale:** Simples, sem dependências externas. O agrupamento por data é feito em memória após query filtrada — volume máximo de 30 dias × N lições por dia é gerenciável.

---

### 4. `dailyGoalLessons` — adicionar ao schema?

**Decisão:** Adicionar campo `dailyGoalLessons Int @default(1)` ao `UserPreferences` no schema Prisma e criar migration.

**Alternativa considerada:** Retornar apenas `dailyGoalMinutes` e ignorar `dailyGoalLessons` no MVP.

**Rationale:** O PRD e o proposal especificam `dailyGoalLessons` como parte do contrato do endpoint. Adicionar o campo é uma migration mínima e não-destrutiva. Omiti-lo quebraria o contrato definido.

---

### 5. Nível atual (`currentLevel`) — como calcular?

**Decisão:** Usar o campo `currentLevel` armazenado em `UserProgress`. A lógica de progressão de nível já existe no `CompleteLessonUseCase` (CHG-006), que deve atualizar `currentLevel` baseado em thresholds de XP.

**Verificação necessária:** Confirmar que CHG-006 já persiste `currentLevel` corretamente. Se não, o `ProgressRepository.upsertProgress` deve ser ajustado para calcular `currentLevel = floor(totalXP / XP_PER_LEVEL) + 1`.

## Risks / Trade-offs

| Risco | Mitigação |
|-------|-----------|
| `minutesStudied` sem acumulador pode ficar lento com muitas completions por usuário | Aceitar para MVP; monitorar via métricas de latência p95; adicionar campo acumulado em V2 se necessário |
| Schema migration (`dailyGoalLessons`) pode causar downtime em deploy sem zero-migration strategy | Migration `ADD COLUMN ... DEFAULT 1` é não-destrutiva e safe em PostgreSQL — sem downtime |
| `currentLevel` pode estar desatualizado se CHG-006 não implementou a progressão | Investigar `CompleteLessonUseCase` antes de implementar; adicionar lógica de progressão no `upsertProgress` se ausente |
| Acesso ao `ProgressRepository` a partir do novo `ProgressController` dentro do mesmo módulo | Sem risco — mesmo módulo, sem dependência circular |
