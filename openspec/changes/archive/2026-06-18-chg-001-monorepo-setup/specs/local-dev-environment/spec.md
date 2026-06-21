## ADDED Requirements

### Requirement: Docker Compose local environment
The repository root SHALL have a `docker-compose.yml` defining three services — PostgreSQL 15, Redis 7, and pgAdmin — so that developers can start the local infrastructure with a single command.

#### Scenario: Local infrastructure starts successfully
- **WHEN** a developer runs `docker compose up -d`
- **THEN** all three services (postgres, redis, pgadmin) start and reach healthy state within 30 seconds

#### Scenario: PostgreSQL is accessible on configured port
- **WHEN** docker compose is running
- **THEN** PostgreSQL is accessible at `localhost:5432` (or the port defined in `.env`) with the credentials from `.env.example`

#### Scenario: Redis is accessible on configured port
- **WHEN** docker compose is running
- **THEN** Redis is accessible at `localhost:6379` (or the port defined in `.env`)

#### Scenario: pgAdmin is accessible via browser
- **WHEN** docker compose is running
- **THEN** pgAdmin is accessible at `localhost:5050` (or the port defined in `.env`) via HTTP

### Requirement: Environment variables documentation
The repository root SHALL have a `.env.example` file documenting all environment variables required to run the local stack, with placeholder values and inline comments explaining each variable.

#### Scenario: Developer can bootstrap local environment
- **WHEN** a developer copies `.env.example` to `.env` and fills in the required values
- **THEN** all services start and the applications connect to the local infrastructure without additional configuration

#### Scenario: No secrets are committed to the repository
- **WHEN** a developer commits changes to the repository
- **THEN** `.env` is excluded by `.gitignore` and only `.env.example` is versioned
