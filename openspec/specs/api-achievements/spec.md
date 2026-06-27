# API Achievements Capability Spec

## Purpose

Expõe o catálogo global de conquistas da plataforma e as conquistas desbloqueadas pelo usuário autenticado. Inclui a lógica interna de desbloqueio automático após a conclusão de uma lição, executada pelo `AchievementUnlockService`. Todos os endpoints públicos exigem autenticação JWT; o desbloqueio é interno ao domínio.

---

## Requirements

### Requirement: User can retrieve all available achievements
The system SHALL expose a `GET /api/v1/achievements` endpoint that returns the full catalog of achievements available on the platform, regardless of the user's unlock status.

**RBAC:** USER, ADMIN, SUPER_ADMIN
**Auth:** Bearer JWT (RS256)
**tenant_id validation:** Endpoint is accessible to any authenticated user; `Achievement` records are platform-wide (no `tenant_id` on `Achievement`).

**Response contract (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Primeira Lição",
      "description": "Complete sua primeira lição",
      "iconUrl": "/icons/achievements/first-lesson.svg",
      "xpReward": 50,
      "criteria": { "type": "lessons_completed", "threshold": 1 }
    }
  ],
  "metadata": {}
}
```

**Notes:**
- The catalog SHALL be served with Redis cache (TTL 1h, Cache-aside), as achievements change infrequently.
- `criteria` is a JSON object stored verbatim from the `Achievement.criteria` field.
- The 10 seed achievements SHALL be: Primeira Lição, Sequência de 3 dias, Sequência de 7 dias, 100 XP, 500 XP, 10 lições, 25 lições, Iniciante, Intermediário, Avançado.

#### Scenario: Authenticated user retrieves achievement catalog
- **WHEN** a USER with JWT makes `GET /api/v1/achievements`
- **THEN** the system returns HTTP 200 with `data` as an array of at least 10 achievements, each with `id`, `name`, `description`, `iconUrl`, `xpReward`, and `criteria`

#### Scenario: Catalog is served from Redis on second request
- **WHEN** the same `GET /api/v1/achievements` request is made twice consecutively
- **THEN** the second request is served from Redis cache without hitting the database

#### Scenario: Request without valid JWT is rejected
- **WHEN** a request is made to `GET /api/v1/achievements` without an `Authorization: Bearer` header or with an expired token
- **THEN** the system returns HTTP 401 with `{ "error": { "code": "UNAUTHORIZED", "message": "Token inválido ou ausente" } }`

---

### Requirement: User can retrieve their unlocked achievements
The system SHALL expose a `GET /api/v1/achievements/me` endpoint that returns only the achievements unlocked by the authenticated user, each with the unlock timestamp, scoped to their `tenant_id`.

**RBAC:** USER, ADMIN, SUPER_ADMIN (own achievements only)
**Auth:** Bearer JWT (RS256)
**tenant_id validation:** Unlocked achievements are scoped to the user's own `tenant_id` — no cross-tenant access.

**Response contract (200):**
```json
{
  "data": [
    {
      "achievement": {
        "id": "uuid",
        "name": "Primeira Lição",
        "description": "Complete sua primeira lição",
        "iconUrl": "/icons/achievements/first-lesson.svg",
        "xpReward": 50,
        "criteria": { "type": "lessons_completed", "threshold": 1 }
      },
      "unlockedAt": "2025-01-24T10:00:00.000Z"
    }
  ],
  "metadata": {}
}
```

**Notes:**
- Results SHALL be ordered ascending by `unlockedAt` (earliest first).
- If the user has no unlocked achievements, `data` SHALL be an empty array (not 404).

#### Scenario: User with unlocked achievements retrieves their list
- **WHEN** a USER with JWT makes `GET /api/v1/achievements/me` and has 2 unlocked achievements
- **THEN** the system returns HTTP 200 with `data` containing 2 entries, each with `achievement` object and `unlockedAt`

#### Scenario: User with no unlocked achievements gets empty list
- **WHEN** a USER who has never unlocked any achievement makes `GET /api/v1/achievements/me`
- **THEN** the system returns HTTP 200 with `data: []`

#### Scenario: Request without valid JWT is rejected
- **WHEN** a request is made to `GET /api/v1/achievements/me` without an `Authorization: Bearer` header or with an expired token
- **THEN** the system returns HTTP 401 with `{ "error": { "code": "UNAUTHORIZED", "message": "Token inválido ou ausente" } }`

#### Scenario: Response includes observability context
- **WHEN** `GET /api/v1/achievements/me` is processed
- **THEN** a structured log entry SHALL be emitted with `timestamp`, `level`, `service`, `trace_id`, `user_id`, `tenant_id` — and SHALL NOT include any token or password value

---

### Requirement: System automatically unlocks achievements after lesson completion
The system SHALL evaluate and unlock applicable achievements for a user immediately after a successful lesson completion, using `AchievementUnlockService`. The evaluation is idempotent: the same achievement SHALL NOT be unlocked twice for the same user.

**Trigger:** Called by `CompleteLessonUseCase` after the Prisma transaction commits.
**RBAC:** Internal — not a public endpoint.
**tenant_id validation:** All `UserAchievement` records store the user's `tenant_id`.

**MVP Criteria evaluated:**

| Achievement | Criteria type | Threshold |
|---|---|---|
| Primeira Lição | `lessons_completed` | 1 |
| Sequência de 3 dias | `streak_days` | 3 |
| Sequência de 7 dias | `streak_days` | 7 |
| 100 XP | `total_xp` | 100 |
| 500 XP | `total_xp` | 500 |
| 10 lições | `lessons_completed` | 10 |
| 25 lições | `lessons_completed` | 25 |
| Iniciante | `lessons_completed` | 1 |
| Intermediário | `total_xp` | 100 |
| Avançado | `total_xp` | 500 |

**Notes:**
- The service receives `{ userId, tenantId, totalXP, currentStreakDays, lessonsCompleted }` as input.
- Idempotence is enforced via a unique constraint `@@unique([userId, achievementId])` on `UserAchievement` — the service uses `createMany` with `skipDuplicates: true`.
- Returns an array of newly unlocked `{ id, name, iconUrl }` objects (empty array if none).
- The `CompleteLessonUseCase` response SHALL include `newAchievements` field with this array.

#### Scenario: First lesson completion unlocks "Primeira Lição"
- **WHEN** a user completes their first lesson (`lessonsCompleted` becomes 1)
- **THEN** `AchievementUnlockService` returns `[{ id, name: "Primeira Lição", iconUrl }]` and a `UserAchievement` record is persisted

#### Scenario: Achievement unlock is idempotent
- **WHEN** a user completes a lesson for the second time with `lessonsCompleted` still at the threshold
- **THEN** no duplicate `UserAchievement` record is created and `newAchievements` returns `[]`

#### Scenario: Multiple achievements can be unlocked in one completion
- **WHEN** a user's lesson completion brings them to exactly 100 XP and 10 lessons completed simultaneously
- **THEN** all applicable achievements are evaluated and all newly eligible ones are unlocked and returned in `newAchievements`

#### Scenario: Lesson completion response includes newAchievements
- **WHEN** `POST /api/v1/lessons/{id}/complete` succeeds and unlocks 1 new achievement
- **THEN** the response `data.newAchievements` contains that achievement's `{ id, name, iconUrl }` and `data.newAchievements` is an empty array when no new achievements are unlocked
