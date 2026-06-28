# api-reviews Spec

## Purpose

Specifies the spaced repetition review system for the LinguoUp platform. Covers how review items are created when lessons are completed, and how students retrieve recommended review items scheduled for today.

---

## Requirements

### Requirement: Student can retrieve spaced review items recommended for today
The system SHALL expose `GET /api/v1/reviews/recommended` returning review items whose `nextReviewAt` is less than or equal to the current UTC timestamp, ordered by oldest `nextReviewAt` first (most overdue first). Authentication (JWT Bearer) and `tenant_id` isolation are mandatory.

**Request:**
```
GET /api/v1/reviews/recommended?limit=20
Authorization: Bearer <jwt>
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "lessonId": "uuid",
      "lessonTitle": "Cumprimentos em Inglês",
      "itemContent": "Hello",
      "itemType": "vocabulary",
      "dueDate": "2026-06-27T00:00:00Z",
      "priority": 1
    }
  ],
  "metadata": {
    "total": 12,
    "overdueCount": 5
  }
}
```

**Error (401 Unauthorized):**
```json
{ "error": { "code": "UNAUTHORIZED", "message": "Missing or invalid token" } }
```

**RBAC:** USER role required. ADMIN/SUPER_ADMIN may also call this endpoint scoped to their own user.

**Filtering rules:**
- Only items where `nextReviewAt <= CURRENT_TIMESTAMP UTC` are returned.
- Items are sorted by `nextReviewAt ASC` (most overdue first).
- `limit` query parameter caps the response (default: 20, max: 100).
- `overdueCount` reports the total number of overdue items (regardless of `limit`).
- Items belong to the authenticated user's `userId` and `tenantId`.

#### Scenario: User with overdue items receives ordered list
- **WHEN** authenticated user calls `GET /api/v1/reviews/recommended`
- **THEN** system returns items where `nextReviewAt <= now()` ordered by `nextReviewAt ASC`
- **THEN** response includes `metadata.total` and `metadata.overdueCount`

#### Scenario: Limit parameter caps results
- **WHEN** user calls `GET /api/v1/reviews/recommended?limit=5` and has 12 overdue items
- **THEN** system returns exactly 5 items
- **THEN** `metadata.total` reflects 12

#### Scenario: User with no due items receives empty list
- **WHEN** authenticated user has no items with `nextReviewAt <= now()`
- **THEN** system returns `data: []` and `metadata: { total: 0, overdueCount: 0 }`

#### Scenario: Unauthenticated request is rejected
- **WHEN** request is made without a valid Bearer token
- **THEN** system returns HTTP 401 with error code `UNAUTHORIZED`

#### Scenario: Cross-tenant isolation
- **WHEN** user from tenant A calls the endpoint
- **THEN** system returns ONLY items belonging to that user's `tenantId`
- **THEN** items from other tenants are never returned

---

### Requirement: SpacedReviewItem is automatically created when a lesson is completed
The system SHALL create one `SpacedReviewItem` per vocabulary/grammar item in a lesson when the `CompleteLesson` use case is executed. Each item SHALL be initialized with `nextReviewAt = today + 1 day` and `easeFactor = 2.5` (SM-2 default). Creation SHALL be atomic with lesson completion (same Prisma transaction).

**Initial state per item:**
- `interval`: 1 (day)
- `easeFactor`: 2.5
- `repetitions`: 0
- `nextReviewAt`: `now() + 1 day` (UTC)
- `quality`: null (not yet reviewed)

#### Scenario: Lesson completion creates review items
- **WHEN** user successfully completes a lesson with 5 vocabulary items
- **THEN** system creates 5 `SpacedReviewItem` records for that user
- **THEN** each item has `nextReviewAt = now() + 1 day`, `easeFactor = 2.5`, `interval = 1`

#### Scenario: Review items are created atomically with lesson completion
- **WHEN** lesson completion transaction fails (e.g., DB error)
- **THEN** neither `LessonProgress` nor `SpacedReviewItem` records are persisted

#### Scenario: Re-completing the same lesson does not create duplicate review items
- **WHEN** user completes a lesson they have already completed
- **THEN** system does NOT create duplicate `SpacedReviewItem` records for existing items
- **THEN** existing items retain their current SM-2 state
