## MODIFIED Requirements

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
