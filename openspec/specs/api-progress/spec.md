# api-progress

## Purpose

Defines the requirements for the `GET /api/v1/progress` endpoint, which returns the authenticated user's aggregated learning progress data scoped to their `tenant_id`.

---

## Requirements

### Requirement: User can retrieve their general learning progress
The system SHALL expose a `GET /api/v1/progress` endpoint that returns the authenticated user's aggregated learning progress data, scoped to their `tenant_id`.

**RBAC:** USER, ADMIN, SUPER_ADMIN (own progress only)
**Auth:** Bearer JWT (RS256)
**tenant_id validation:** Progress is always scoped to the user's own `tenant_id` — no cross-tenant access.

**Response contract:**
```json
{
  "data": {
    "totalXP": 350,
    "currentLevel": 2,
    "lessonsCompleted": 7,
    "minutesStudied": 84,
    "vocabularyLearned": 42,
    "weeklyActivity": [
      { "date": "2025-01-20", "lessonsCompleted": 2, "minutesStudied": 24 }
    ],
    "monthlyActivity": [
      { "week": "2025-W03", "lessonsCompleted": 5 }
    ]
  }
}
```

**Notes:**
- `minutesStudied` SHALL be computed as `SUM(lesson.durationMinutes)` from all `LessonCompletion` records of the user.
- `vocabularyLearned` SHALL be computed as an estimate: `lessonsCompleted * AVG_VOCAB_PER_LESSON` (constant = 6 for MVP).
- `weeklyActivity` SHALL return the last 7 days (including today), each with aggregated completions and minutes.
- `monthlyActivity` SHALL return the last 4 ISO weeks, each with total completions.
- If the user has no `UserProgress` record, the system SHALL return zeroed values (not 404).

#### Scenario: Authenticated user retrieves progress with activity
- **WHEN** a USER with JWT makes `GET /api/v1/progress`
- **THEN** the system returns HTTP 200 with `data.totalXP`, `data.currentLevel`, `data.lessonsCompleted`, `data.minutesStudied`, `data.weeklyActivity` (7 entries), and `data.monthlyActivity` (4 entries)

#### Scenario: New user with no completions retrieves progress
- **WHEN** a USER who has never completed a lesson makes `GET /api/v1/progress`
- **THEN** the system returns HTTP 200 with all numeric fields as 0, `weeklyActivity` with 7 entries all having `lessonsCompleted: 0`, and `monthlyActivity` with 4 entries all having `lessonsCompleted: 0`

#### Scenario: Request without valid JWT is rejected
- **WHEN** a request is made to `GET /api/v1/progress` without an `Authorization: Bearer` header or with an expired token
- **THEN** the system returns HTTP 401 with `{ "error": { "code": "UNAUTHORIZED", "message": "..." } }`

#### Scenario: Response includes observability context
- **WHEN** `GET /api/v1/progress` is processed
- **THEN** a structured log entry SHALL be emitted with `timestamp`, `level`, `service`, `trace_id`, `user_id`, `tenant_id` — and SHALL NOT include any token or password value
