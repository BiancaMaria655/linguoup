## ADDED Requirements

### Requirement: User can update their daily learning goal
The system SHALL expose a `PATCH /api/v1/users/me/goals` endpoint that allows the authenticated user to update their `dailyGoalMinutes` and/or `dailyGoalLessons`, persisted in `UserPreferences`.

**RBAC:** USER, ADMIN, SUPER_ADMIN (own preferences only)
**Auth:** Bearer JWT (RS256)
**tenant_id validation:** The update applies only to the authenticated user's own `UserPreferences` — no cross-tenant or cross-user access.

**Request contract:**
```json
{
  "dailyGoalMinutes": 20,
  "dailyGoalLessons": 2
}
```
Both fields are optional; at least one must be provided.

**Response contract:**
```json
{
  "data": {
    "dailyGoalMinutes": 20,
    "dailyGoalLessons": 2,
    "updatedAt": "2025-01-24T18:30:00Z"
  }
}
```

**Validation rules:**
- `dailyGoalMinutes`: integer, min 5, max 120 (if provided)
- `dailyGoalLessons`: integer, min 1, max 20 (if provided)
- At least one field MUST be present in the request body; if both are absent, the system SHALL return HTTP 400.

**Schema change:** `dailyGoalLessons Int @default(1)` SHALL be added to `UserPreferences` via a non-destructive migration.

#### Scenario: User updates both daily goals successfully
- **WHEN** a USER with JWT makes `PATCH /api/v1/users/me/goals` with `{ "dailyGoalMinutes": 20, "dailyGoalLessons": 2 }`
- **THEN** the system returns HTTP 200 with `data.dailyGoalMinutes: 20`, `data.dailyGoalLessons: 2`, and `data.updatedAt` as a valid ISO 8601 timestamp

#### Scenario: User updates only dailyGoalMinutes
- **WHEN** a USER makes `PATCH /api/v1/users/me/goals` with `{ "dailyGoalMinutes": 30 }`
- **THEN** the system returns HTTP 200 with `data.dailyGoalMinutes: 30` and `data.dailyGoalLessons` unchanged

#### Scenario: Request with empty body is rejected
- **WHEN** a USER makes `PATCH /api/v1/users/me/goals` with `{}` (no fields)
- **THEN** the system returns HTTP 400 with `{ "error": { "code": "VALIDATION_ERROR", "message": "At least one of dailyGoalMinutes or dailyGoalLessons must be provided" } }`

#### Scenario: dailyGoalMinutes out of range is rejected
- **WHEN** a USER makes `PATCH /api/v1/users/me/goals` with `{ "dailyGoalMinutes": 200 }`
- **THEN** the system returns HTTP 400 with a validation error indicating the value exceeds the maximum of 120

#### Scenario: User with no UserPreferences record gets 404
- **WHEN** a USER who has not completed onboarding (no `UserPreferences`) makes `PATCH /api/v1/users/me/goals`
- **THEN** the system returns HTTP 404 with `{ "error": { "code": "NOT_FOUND", "message": "User preferences not found" } }`

#### Scenario: Request without valid JWT is rejected
- **WHEN** a request is made to `PATCH /api/v1/users/me/goals` without an `Authorization: Bearer` header or with an expired token
- **THEN** the system returns HTTP 401 with `{ "error": { "code": "UNAUTHORIZED", "message": "..." } }`
