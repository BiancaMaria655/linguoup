# Lessons Capability Spec

## Purpose

Gerencia o catálogo de lições, detalhes individuais, conclusão atômica de lições (com XP e streak), avaliação de nível inicial e submissão das respostas de avaliação. Todos os endpoints exigem autenticação JWT e RBAC mínimo `USER`, com isolamento por `tenant_id`.

---

## Requirements

### Requirement: List Lessons Catalog
O sistema SHALL retornar um catálogo paginado de lições disponíveis e ativas (`isActive: true`) para o tenant do usuário autenticado. A listagem usa paginação cursor-based e suporta filtros por `level` e `theme`. O resultado é servido a partir do cache Redis (TTL 1h, Cache-aside). O sistema valida `tenant_id` implícito via JWT, exige RBAC mínimo `USER`, e retorna `{ data: Lesson[], metadata: { cursor, total } }`.

**Endpoint**: `GET /api/v1/lessons`
**RBAC**: `USER` ou superior
**Request**: `?level=<string>&theme=<string>&cursor=<uuid>&limit=<int>`
**Response (200)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "level": "string",
      "theme": "string",
      "durationMinutes": 10
    }
  ],
  "metadata": { "cursor": "uuid|null", "total": 42 }
}
```
**Response (401)**: `{ "error": { "code": "UNAUTHORIZED", "message": "Token inválido ou ausente" } }`

#### Scenario: List all lessons without filters
- **WHEN** usuário autenticado faz `GET /api/v1/lessons` sem query params
- **THEN** sistema retorna lista de lições do tenant com `metadata.cursor` para próxima página

#### Scenario: Filter lessons by level and theme
- **WHEN** usuário faz `GET /api/v1/lessons?level=A1&theme=greetings`
- **THEN** sistema retorna apenas lições com `level=A1` e `theme=greetings` do tenant

#### Scenario: Paginate using cursor
- **WHEN** usuário faz `GET /api/v1/lessons?cursor=<uuid>&limit=10`
- **THEN** sistema retorna as próximas 10 lições a partir do cursor fornecido

#### Scenario: Result served from Redis cache on second request
- **WHEN** a mesma query é feita duas vezes consecutivas
- **THEN** a segunda requisição não acessa o banco de dados (hit de cache Redis)

#### Scenario: Unauthenticated request
- **WHEN** usuário faz requisição sem Bearer token
- **THEN** sistema retorna 401 com `error.code = UNAUTHORIZED`

#### Scenario: Inactive lessons are excluded from catalog
- **WHEN** uma lição possui `isActive: false` no banco de dados e o usuário faz a listagem
- **THEN** a lição inativa não é incluída na resposta do catálogo

---

### Requirement: Get Lesson Detail
O sistema SHALL retornar o detalhe completo de uma lição ativa (`isActive: true`, incluindo `content` com exercícios) para o tenant do usuário autenticado. Valida que a lição pertence ao mesmo `tenant_id` do usuário e que está ativa. RBAC mínimo: `USER`.

**Endpoint**: `GET /api/v1/lessons/{id}`
**RBAC**: `USER` ou superior
**Response (200)**:
```json
{
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "level": "string",
    "theme": "string",
    "durationMinutes": 10,
    "content": { "exercises": [...] }
  }
}
```
**Response (404)**: `{ "error": { "code": "NOT_FOUND", "message": "Lição não encontrada" } }`
**Response (401)**: `{ "error": { "code": "UNAUTHORIZED", "message": "Token inválido ou ausente" } }`

#### Scenario: Get existing lesson detail
- **WHEN** usuário autenticado faz `GET /api/v1/lessons/{id}` com ID válido
- **THEN** sistema retorna lição com `content` completo incluindo exercícios

#### Scenario: Lesson not found or wrong tenant
- **WHEN** usuário faz `GET /api/v1/lessons/{id}` com ID inexistente ou de outro tenant
- **THEN** sistema retorna 404 com `error.code = NOT_FOUND`

#### Scenario: Attempt to get inactive lesson detail
- **WHEN** usuário faz `GET /api/v1/lessons/{id}` com ID de uma lição que possui `isActive: false`
- **THEN** sistema retorna 404 com `error.code = NOT_FOUND`

---

### Requirement: Complete Lesson (Atomic)
O sistema SHALL registrar a conclusão de uma lição em uma transação atômica que: (1) cria `LessonCompletion`, (2) incrementa `UserProgress.totalXP`, (3) atualiza `currentStreakDays` e `lastActivityDate`. Após o commit da transação, o sistema SHALL chamar `AchievementUnlockService.evaluate()` para desbloquear conquistas aplicáveis. A transação usa `prisma.$transaction` com isolamento Serializable. Em caso de falha parcial, toda a operação é revertida. RBAC mínimo: `USER`.

**Endpoint**: `POST /api/v1/lessons/{id}/complete`
**RBAC**: `USER` ou superior
**Request body**:
```json
{ "score": 85, "timeSpentSeconds": 240 }
```
**Response (200):**
```json
{
  "data": {
    "xpEarned": 42,
    "newTotalXP": 1042,
    "streakUpdated": true,
    "streakDays": 7,
    "newAchievements": [
      { "id": "uuid", "name": "Primeira Lição", "iconUrl": "/icons/achievements/first-lesson.svg" }
    ]
  }
}
```
**Response (400)**: `{ "error": { "code": "VALIDATION_ERROR", "message": "score deve ser entre 0 e 100" } }`
**Response (404)**: `{ "error": { "code": "NOT_FOUND", "message": "Lição não encontrada" } }`

**Notes:**
- `newAchievements` SHALL always be present in the response — empty array `[]` if no new achievements were unlocked.
- `AchievementUnlockService.evaluate()` is called **after** the Prisma transaction commits (not inside it).
- If achievement evaluation fails (non-critical error), the lesson completion SHALL still be returned successfully (`newAchievements: []`) and the error logged.

#### Scenario: Complete lesson successfully
- **WHEN** usuário envia `POST /api/v1/lessons/{id}/complete` com `score: 85, timeSpentSeconds: 240`
- **THEN** sistema cria `LessonCompletion`, incrementa `totalXP`, atualiza streak e retorna resultado com campo `newAchievements`

#### Scenario: Streak incremented when user completes lesson on consecutive day
- **WHEN** `UserProgress.lastActivityDate` é yesterday e usuário completa lição hoje
- **THEN** `currentStreakDays` é incrementado em 1 e `lastActivityDate` atualizado para hoje

#### Scenario: Streak reset when user misses a day
- **WHEN** `UserProgress.lastActivityDate` é há 2+ dias e usuário completa lição hoje
- **THEN** `currentStreakDays` é resetado para 1 e `lastActivityDate` atualizado para hoje

#### Scenario: Transaction rollback on partial failure
- **WHEN** a transação falha após criar `LessonCompletion` mas antes de atualizar `UserProgress`
- **THEN** nenhuma alteração é persistida no banco (rollback completo)

#### Scenario: Invalid score
- **WHEN** usuário envia `score: 150` (fora do range 0-100)
- **THEN** sistema retorna 400 com `error.code = VALIDATION_ERROR`

#### Scenario: newAchievements present when first lesson is completed
- **WHEN** usuário completa sua primeira lição (lessonsCompleted passa de 0 para 1)
- **THEN** `data.newAchievements` contém a conquista "Primeira Lição" com `id`, `name` e `iconUrl`

#### Scenario: newAchievements is empty array when no achievements unlocked
- **WHEN** usuário completa uma lição sem atingir nenhum critério de conquista novo
- **THEN** `data.newAchievements` é `[]`

---

### Requirement: Get Level Assessment Questions
O sistema SHALL retornar um conjunto de perguntas de avaliação de nível para o usuário autenticado. As perguntas são lições com `theme: "assessment"` e `content.type: "question"`, seed data no banco. RBAC mínimo: `USER`. Estimativa de 10 minutos máximo.

**Endpoint**: `GET /api/v1/lessons/assessment`
**RBAC**: `USER` ou superior
**Response (200)**:
```json
{
  "data": {
    "questions": [
      {
        "id": "uuid",
        "text": "string",
        "options": ["A", "B", "C", "D"],
        "type": "multiple_choice"
      }
    ],
    "estimatedMinutes": 10
  }
}
```

#### Scenario: Get assessment questions
- **WHEN** usuário autenticado faz `GET /api/v1/lessons/assessment`
- **THEN** sistema retorna lista de perguntas de avaliação com campo `estimatedMinutes: 10`

#### Scenario: Assessment not available without authentication
- **WHEN** usuário faz requisição sem Bearer token
- **THEN** sistema retorna 401 com `error.code = UNAUTHORIZED`

---

### Requirement: Submit Level Assessment
O sistema SHALL receber as respostas da avaliação de nível, calcular o nível identificado via `AssessmentEvaluationService`, e retornar o nível com descrição e trilha recomendada. RBAC mínimo: `USER`.

**Endpoint**: `POST /api/v1/lessons/assessment/submit`
**RBAC**: `USER` ou superior
**Request body**:
```json
{
  "answers": [
    { "questionId": "uuid", "answer": "B" }
  ]
}
```
**Response (200)**:
```json
{
  "data": {
    "level": "A2",
    "description": "Iniciante avançado",
    "recommendedTrack": "A2-Everyday-Conversations"
  }
}
```
**Response (400)**: `{ "error": { "code": "VALIDATION_ERROR", "message": "answers não pode ser vazio" } }`

#### Scenario: Submit assessment and receive level result
- **WHEN** usuário envia respostas válidas para todas as perguntas
- **THEN** sistema calcula e retorna `level`, `description` e `recommendedTrack`

#### Scenario: Submit empty answers
- **WHEN** usuário envia `answers: []`
- **THEN** sistema retorna 400 com `error.code = VALIDATION_ERROR`

#### Scenario: Partial answers determine level from available data
- **WHEN** usuário envia respostas para apenas parte das perguntas
- **THEN** sistema calcula nível com base nas respostas fornecidas (sem erro)
