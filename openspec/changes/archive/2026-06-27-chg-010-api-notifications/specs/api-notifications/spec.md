## ADDED Requirements

### Requirement: User can list notification history
The system SHALL provide a paginated endpoint for the authenticated user to retrieve their own notification history.

The endpoint SHALL:
- Return notifications ordered by `createdAt` DESC (most recent first).
- Support cursor-based pagination (`cursor`, `limit` ≤ 50, default 20).
- Accept an optional `unreadOnly=true` query parameter to filter unread notifications.
- Return `metadata.unreadCount` with the total number of unread notifications for the user.
- Validate that `tenant_id` matches the authenticated user's tenant.
- Require RBAC role: `USER` or higher.

**Request:**
```
GET /api/v1/notifications?cursor=<cursor>&limit=20&unreadOnly=false
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "REMINDER",
      "channel": "PUSH",
      "message": "Hora de praticar! Você tem uma lição pendente.",
      "readAt": null,
      "sentAt": "2024-06-01T08:00:00Z",
      "createdAt": "2024-06-01T08:00:00Z"
    }
  ],
  "metadata": {
    "cursor": "next-cursor-value",
    "total": 42,
    "unreadCount": 5
  }
}
```

#### Scenario: Authenticated user fetches notification history
- **WHEN** `GET /api/v1/notifications` is called with a valid Bearer token
- **THEN** the system returns `200` with a paginated list of the user's notifications ordered by `createdAt` DESC

#### Scenario: User filters unread notifications
- **WHEN** `GET /api/v1/notifications?unreadOnly=true` is called
- **THEN** the system returns only notifications where `readAt` is null

#### Scenario: Unauthenticated request
- **WHEN** `GET /api/v1/notifications` is called without a valid token
- **THEN** the system returns `401 Unauthorized`

#### Scenario: User accesses another user's notifications
- **WHEN** `GET /api/v1/notifications` is called with a valid token
- **THEN** the system ONLY returns notifications belonging to the authenticated user (tenant_id enforced)

---

### Requirement: User can mark a notification as read
The system SHALL allow the authenticated user to mark one of their own notifications as read.

The endpoint SHALL:
- Accept `PATCH /api/v1/notifications/{id}/read`.
- Set `readAt` to the current UTC timestamp if not already set.
- Return `404` if the notification does not exist or does not belong to the user.
- Be idempotent: if already read, return `200` with the existing `readAt`.
- Require RBAC role: `USER` or higher.

**Request:**
```
PATCH /api/v1/notifications/{id}/read
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": {
    "id": "uuid",
    "readAt": "2024-06-01T10:30:00Z"
  }
}
```

#### Scenario: User marks an unread notification as read
- **WHEN** `PATCH /api/v1/notifications/{id}/read` is called for an unread notification owned by the user
- **THEN** the system sets `readAt` to now and returns `200`

#### Scenario: User marks an already-read notification as read (idempotent)
- **WHEN** `PATCH /api/v1/notifications/{id}/read` is called for an already-read notification
- **THEN** the system returns `200` with the existing `readAt` (no change)

#### Scenario: Notification not found or not owned by user
- **WHEN** `PATCH /api/v1/notifications/{id}/read` is called for an id that does not belong to the user
- **THEN** the system returns `404 Not Found`

#### Scenario: Unauthenticated request
- **WHEN** `PATCH /api/v1/notifications/{id}/read` is called without a valid token
- **THEN** the system returns `401 Unauthorized`

---

### Requirement: Admin can send a test notification
The system SHALL provide a protected endpoint allowing ADMIN users to trigger a test push notification to any user.

The endpoint SHALL:
- Accept `POST /api/v1/notifications/test`.
- Require RBAC role: `ADMIN` or `SUPER_ADMIN`.
- Accept `{ userId: string, message: string }` in the request body.
- Attempt to send a push notification via FCM to the target user.
- Return `400` if `userId` is invalid or user has no registered FCM token.
- Log the action with `trace_id`, `user_id` (admin), and `target_user_id`.

**Request:**
```
POST /api/v1/notifications/test
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "userId": "target-user-uuid",
  "message": "Test push notification"
}
```

**Response (200):**
```json
{
  "data": {
    "sent": true
  }
}
```

#### Scenario: Admin sends a test notification successfully
- **WHEN** `POST /api/v1/notifications/test` is called with a valid ADMIN token and a userId with a registered FCM token
- **THEN** the system sends the push via FCM and returns `200 { data: { sent: true } }`

#### Scenario: Target user has no FCM token
- **WHEN** `POST /api/v1/notifications/test` is called for a user without a registered FCM token
- **THEN** the system returns `400 Bad Request` with error code `NOTIFICATION_NO_FCM_TOKEN`

#### Scenario: Non-admin user attempts to send test notification
- **WHEN** `POST /api/v1/notifications/test` is called with a USER role token
- **THEN** the system returns `403 Forbidden`

---

### Requirement: System sends daily study reminders
The system SHALL automatically send daily study reminders to users who have configured a `studyReminderTime` preference.

The `DailyReminderScheduler` SHALL:
- Run daily via `@Cron` at a configured interval (e.g., every minute, checking per-user `studyReminderTime`).
- For each active user with a `studyReminderTime` set: check if a `REMINDER` notification was already sent today (UTC).
- If not sent today: create a `Notification` record, then dispatch via FCM (if FCM token present) and/or email (if `studyReminderEmail` enabled).
- Guarantee at-most-once delivery per user per day using the `Notification` table as deduplication source.
- Handle FCM and SES failures in isolation: failure for one user MUST NOT abort processing for other users.
- Log each send attempt with `user_id`, `channel`, `success/failure`, and `trace_id`.
- Remove stale FCM tokens: if FCM returns `UNREGISTERED`, set `user.fcmToken = null`.
- Require no HTTP endpoint (internal scheduler only).

#### Scenario: User with reminder preference receives daily push
- **WHEN** the scheduler runs and the current UTC time matches a user's `studyReminderTime`
- **THEN** the system creates a `Notification` record and sends a FCM push to that user

#### Scenario: User already received reminder today
- **WHEN** the scheduler runs and a `REMINDER` notification with `sentAt` today already exists for the user
- **THEN** the system skips the user and does not send a duplicate

#### Scenario: FCM token is expired (UNREGISTERED)
- **WHEN** FCM returns an `UNREGISTERED` error for a user's token
- **THEN** the system sets `user.fcmToken = null` and logs the token invalidation

#### Scenario: SES send fails
- **WHEN** AWS SES returns an error for a specific user
- **THEN** the system logs the error with `trace_id` and continues processing remaining users

#### Scenario: User has no reminder preference configured
- **WHEN** the scheduler runs and a user has `studyReminderTime = null`
- **THEN** the system skips that user entirely
