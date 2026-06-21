---
title: API Authentication
status: proposed
---

# API Authentication

## ADDED Requirements

### Requirement: User Registration
The system SHALL allow guest users to register a new account. The system MUST hash the password using Argon2id and associate the user with a valid `tenant_id`.

* **Impacted OpenAPI Endpoints:** `POST /api/v1/auth/register`
* **RBAC Level:** Public (Guest)
* **Tenant Validation:** Required. The `tenant_id` must be provided in the payload or resolved from the request context and persisted in the database.
* **Prisma Transactions:** Single insert into `User`.
* **Redis Cache:** No direct cache impact.

**Request Payload:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "StrongPassword123!",
  "tenant_id": "tenant-default"
}
```

**Response Payload (Success - 201 Created):**
```json
{
  "data": {
    "userId": "d3b07384-d113-4956-a547-aa16c3b6f123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "metadata": {}
}
```

#### Scenario: Successful Registration
- **WHEN** a guest user submits registration details with a unique email, name, password (minimum 8 characters), and a valid `tenant_id`
- **THEN** the system SHALL create the user record with the Argon2id hashed password and return the user profile with a 201 status code

#### Scenario: Duplicate Email Registration
- **WHEN** a guest user submits registration details with an email that is already registered in the system
- **THEN** the system SHALL reject the request with a 400 Bad Request status code and return a specific duplicate email error message

---

### Requirement: User Login
The system SHALL authenticate a user using email and password, returning an Access Token (JWT) in the response body and a Refresh Token in a secure HttpOnly cookie.

* **Impacted OpenAPI Endpoints:** `POST /api/v1/auth/login`
* **RBAC Level:** Public (Guest)
* **Tenant Validation:** Required. The system MUST verify that the user belongs to the requested `tenant_id` context.
* **Redis Cache:** Optional sessions caching if needed, but primarily verified statelessly.
* **Rate Limiting:** Maximum 10 login/register requests per minute per IP.

**Request Payload:**
```json
{
  "email": "user@example.com",
  "password": "StrongPassword123!"
}
```

**Response Payload (Success - 200 OK):**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  },
  "metadata": {}
}
```
**Set-Cookie Header:**
`refreshToken=d3b07384-refresh-token...; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth; Max-Age=2592000`

#### Scenario: Successful Login
- **WHEN** a user submits valid email and password credentials
- **THEN** the system SHALL return a 200 status code with a stateless Access Token JWT valid for 15 minutes, and set a secure, HttpOnly, SameSite=Strict Refresh Token cookie valid for 30 days

#### Scenario: Invalid Credentials
- **WHEN** a user submits incorrect email or password
- **THEN** the system SHALL reject the request with a 401 Unauthorized status code

---

### Requirement: Token Refresh
The system SHALL refresh an Access Token using a valid Refresh Token. The system MUST implement Refresh Token Rotation (RTR), invalidating the used Refresh Token and returning a new pair of Access and Refresh Tokens.

* **Impacted OpenAPI Endpoints:** `POST /api/v1/auth/refresh`
* **RBAC Level:** Public (requires valid Refresh Token cookie)
* **Tenant Validation:** Required. The `tenant_id` must be extracted from the Refresh Token payload and validated.
* **Redis Cache / Database:** The system SHALL check if the token has been blacklisted or previously used.
* **Redis TTL:** Blacklisted tokens are stored in Redis with a TTL matching the token's expiration time.

**Response Payload (Success - 200 OK):**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  },
  "metadata": {}
}
```
**Set-Cookie Header:**
`refreshToken=new-rotated-refresh-token...; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth; Max-Age=2592000`

#### Scenario: Successful Token Refresh
- **WHEN** the system receives a token refresh request containing a valid, active Refresh Token in the cookies
- **THEN** the system SHALL rotate the Refresh Token, invalidate the old token, set a new Refresh Token cookie, and return a new Access Token in the response body with a 200 status code

#### Scenario: Reuse of a Revoked Refresh Token
- **WHEN** a refresh request is made using a Refresh Token that has already been rotated (indicating potential token theft)
- **THEN** the system SHALL immediately invalidate all active sessions/tokens associated with that token family (the user) and reject the request with a 401 Unauthorized status code

---

### Requirement: User Logout
The system SHALL invalidate the user's active session by blacklisting the active Refresh Token in Redis and clearing the client cookies.

* **Impacted OpenAPI Endpoints:** `POST /api/v1/auth/logout`
* **RBAC Level:** Authenticated (`USER`, `ADMIN`, or `SUPER_ADMIN`)
* **Tenant Validation:** Extracted and validated from the active JWT.
* **Redis Cache:** Add current Refresh Token to Redis blacklist. TTL set to remaining lifetime of the token.

**Response Payload (Success - 200 OK):**
```json
{
  "data": {
    "message": "Logged out successfully"
  },
  "metadata": {}
}
```

#### Scenario: Successful Logout
- **WHEN** an authenticated user calls the logout endpoint with their active session token
- **THEN** the system SHALL add the current Refresh Token to the Redis blacklist, clear the Refresh Token cookie from the client, and return a 200 status code

---

### Requirement: API Route Protection and RBAC
The system SHALL secure all protected API endpoints, enforcing valid JWT authentication and verifying that the user has the required Role-Based Access Control (RBAC) privileges.

* **Impacted OpenAPI Endpoints:** All `/api/v1/*` endpoints except public authentication routes.
* **RBAC Level:** Checked dynamically per route (e.g. `USER`, `ADMIN`, `SUPER_ADMIN`).
* **Tenant Validation:** Required. Every request to a protected endpoint MUST validate the `tenant_id` claim in the JWT.

#### Scenario: Accessing Protected Route with Valid Credentials
- **WHEN** a user requests a protected endpoint with a valid Access Token JWT containing the correct role and `tenant_id`
- **THEN** the system SHALL permit access and process the request

#### Scenario: Accessing Protected Route without Token
- **WHEN** a user requests a protected endpoint without providing an Authorization header or using an invalid token
- **THEN** the system SHALL block access and return a 401 Unauthorized status code

#### Scenario: Accessing Route with Insufficient RBAC Permissions
- **WHEN** a user with the `USER` role requests an endpoint that explicitly requires the `ADMIN` or `SUPER_ADMIN` role
- **THEN** the system SHALL block access and return a 403 Forbidden status code
