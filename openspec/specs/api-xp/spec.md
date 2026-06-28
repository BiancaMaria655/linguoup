# API XP Capability Spec

## Purpose

Expõe o total de XP acumulado e o histórico cronológico de ganhos de XP do usuário autenticado. Os dados são lidos de `UserProgress.totalXP` e dos registros de `LessonCompletion`, sempre com isolamento por `tenant_id`.

---

## Requirements

### Requirement: User can retrieve their XP total and history
The system SHALL expose a `GET /api/v1/xp` endpoint that returns the authenticated user's total accumulated XP and a chronological history of XP gains, each entry linked to the source lesson, scoped to their `tenant_id`.

**RBAC:** USER, ADMIN, SUPER_ADMIN (own XP only)
**Auth:** Bearer JWT (RS256)
**tenant_id validation:** XP data is always scoped to the user's own `tenant_id` — no cross-tenant access.

**Response contract (200):**
```json
{
  "data": {
    "total": 350,
    "history": [
      {
        "xpEarned": 42,
        "source": "lesson",
        "lessonId": "uuid",
        "earnedAt": "2025-01-24T10:00:00.000Z"
      }
    ]
  },
  "metadata": {}
}
```

**Notes:**
- `total` SHALL be read from `UserProgress.totalXP` for the authenticated user.
- `history` SHALL be derived from `LessonCompletion` records (`xpEarned`, `completedAt` as `earnedAt`, `lessonId`), ordered descending by `completedAt` (most recent first).
- `source` SHALL always be `"lesson"` in MVP (other XP sources are V2+).
- If the user has no `UserProgress` record, `total` SHALL be `0`.
- If the user has no `LessonCompletion` records, `history` SHALL be an empty array.

#### Scenario: Authenticated user retrieves XP with history
- **WHEN** a USER with JWT makes `GET /api/v1/xp`
- **THEN** the system returns HTTP 200 with `data.total` (integer ≥ 0) and `data.history` as a non-null array ordered descending by `earnedAt`

#### Scenario: New user with no completions retrieves XP
- **WHEN** a USER who has never completed a lesson makes `GET /api/v1/xp`
- **THEN** the system returns HTTP 200 with `data.total: 0` and `data.history: []`

#### Scenario: XP history includes all past lesson completions
- **WHEN** a USER has completed 5 lessons with varying XP amounts
- **THEN** `data.history` contains exactly 5 entries, each with `xpEarned`, `source: "lesson"`, `lessonId`, and `earnedAt`

#### Scenario: Request without valid JWT is rejected
- **WHEN** a request is made to `GET /api/v1/xp` without an `Authorization: Bearer` header or with an expired token
- **THEN** the system returns HTTP 401 with `{ "error": { "code": "UNAUTHORIZED", "message": "Token inválido ou ausente" } }`

#### Scenario: Response includes observability context
- **WHEN** `GET /api/v1/xp` is processed
- **THEN** a structured log entry SHALL be emitted with `timestamp`, `level`, `service`, `trace_id`, `user_id`, `tenant_id` — and SHALL NOT include any token or password value
