## ADDED Requirements

### Requirement: User can retrieve their streak and activity calendar
The system SHALL expose a `GET /api/v1/streak` endpoint that returns the authenticated user's current streak, longest streak, and a 30-day activity calendar, scoped to their `tenant_id`.

**RBAC:** USER, ADMIN, SUPER_ADMIN (own streak only)
**Auth:** Bearer JWT (RS256)
**tenant_id validation:** Streak data is scoped to the user's own `tenant_id` — no cross-tenant access.

**Response contract:**
```json
{
  "data": {
    "currentStreak": 5,
    "longestStreak": 12,
    "lastActivityDate": "2025-01-24",
    "activityCalendar": [
      { "date": "2025-12-26", "active": false },
      { "date": "2025-12-27", "active": true }
    ]
  }
}
```

**Notes:**
- `activityCalendar` SHALL contain exactly 30 entries, ordered ascending by date, covering the 30 days ending today (inclusive).
- A day is `active: true` if the user has at least one `LessonCompletion` with `completedAt` on that calendar date (UTC).
- `currentStreak` and `longestStreak` are read from `UserProgress` (set by `CompleteLessonUseCase`).
- If the user has no `UserProgress` record, the system SHALL return `currentStreak: 0`, `longestStreak: 0`, `lastActivityDate: null`, and 30 days all `active: false`.

#### Scenario: Authenticated user retrieves streak with activity
- **WHEN** a USER with JWT makes `GET /api/v1/streak`
- **THEN** the system returns HTTP 200 with `data.currentStreak`, `data.longestStreak`, `data.lastActivityDate`, and `data.activityCalendar` (exactly 30 entries)

#### Scenario: Activity calendar marks active days correctly
- **WHEN** the user completed at least one lesson on day D within the last 30 days
- **THEN** the calendar entry for day D SHALL have `active: true`; days with no completions SHALL have `active: false`

#### Scenario: User with no activity returns zeroed streak
- **WHEN** a USER with no lesson completions makes `GET /api/v1/streak`
- **THEN** the system returns HTTP 200 with `currentStreak: 0`, `longestStreak: 0`, `lastActivityDate: null`, and all 30 calendar entries `active: false`

#### Scenario: Request without valid JWT is rejected
- **WHEN** a request is made to `GET /api/v1/streak` without an `Authorization: Bearer` header or with an expired token
- **THEN** the system returns HTTP 401 with `{ "error": { "code": "UNAUTHORIZED", "message": "..." } }`

#### Scenario: Response includes observability context
- **WHEN** `GET /api/v1/streak` is processed
- **THEN** a structured log entry SHALL be emitted with `timestamp`, `level`, `service`, `trace_id`, `user_id`, `tenant_id` — and SHALL NOT include any token or password value
