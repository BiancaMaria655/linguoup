## Context

LinguoUp requires a robust, transactional persistence layer to store user profiles, learning preferences, lesson contents, user progress, gamification streaks, and achievements. Currently, no database structure or ORM setup exists in the project. This design details the setup of PostgreSQL 15+ using Prisma ORM inside the `packages/database` package, which will serve as the single source of truth for the transactional state of the application.

## Goals / Non-Goals

**Goals:**
* Configure Prisma ORM inside `packages/database` with a PostgreSQL provider.
* Design the database schema to support all core V1 (MVP) entities: `User`, `UserPreferences`, `Lesson`, `LessonCompletion`, `UserProgress`, `Achievement`, `UserAchievement`, `SpacedReviewItem`, and `Notification`.
* Implement a logical multi-tenancy model using `tenant_id` fields on all primary entities (`User`, `Lesson`, `UserProgress`).
* Provide a seed script to populate development environments with initial sample data.
* Standardize database administration scripts (migrate, seed, studio) within the root package manager.

**Non-Goals:**
* Implementing database repositories or backend service logic (this will be covered in CHG-004).
* Setting up multi-region database replication or physical tenant isolation (separate databases/schemas).
* Integrating with external identity provider databases (e.g. Auth0 mapping logic, which will be handled in service layers).

## Decisions

### 1. Database ORM: Prisma ORM with PostgreSQL
* **Choice:** Prisma ORM.
* **Alternative Considered:** TypeORM or Kysely.
* **Rationale:** Prisma offers a clean, type-safe API with automatic client generation based on the schema definition. Since our backend uses NestJS and TypeScript, Prisma's strong typing aligns perfectly with our need to maintain type safety across application boundaries. PostgreSQL is our chosen relational database due to its reliability, support for JSON columns (needed for flexible content/criteria structures), and robust transactional features.

### 2. Multi-Tenancy Strategy: Logical Isolation via `tenant_id`
* **Choice:** Logical isolation by adding `tenant_id` column to primary tables.
* **Alternative Considered:** Separate Database or Schema-per-Tenant.
* **Rationale:** A schema-per-tenant or database-per-tenant strategy introduces high operational complexity and overhead that is not justified for an MVP. Logical separation via `tenant_id` allows us to run on a single database instance with minimal resource usage, while ensuring that queries can partition data easily. The backend repositories must strictly enforce filtering by `tenant_id` to prevent cross-tenant data leakage.

### 3. Package Structure: Modular Monolith Package (`packages/database`)
* **Choice:** Keep Prisma schema, migrations, and seed scripts inside `packages/database`. Export the initialized `PrismaClient` from the package.
* **Alternative Considered:** Place Prisma config directly inside the NestJS API application.
* **Rationale:** Keeping the database layer as a separate monorepo workspace package allows it to be imported by the API app (`apps/api`), and potentially by any admin scripts or background workers (`apps/web` or worker applications) in the future without duplicating the schema definition.

### 4. JSON Columns for Content and Achievement Criteria
* **Choice:** Use `Json` data types in Prisma for `Lesson.content` and `Achievement.criteria`.
* **Alternative Considered:** Normalized tables (e.g. separate tables for question types, choices, and rules).
* **Rationale:** Lesson content (e.g. cards, quiz questions, audio elements) and achievement rules (e.g. dynamic parameters for triggering achievements) are highly variable and may evolve rapidly. Storing them as JSON provides flexibility without requiring frequent database schema migrations.

## Risks / Trade-offs

* **[Risk] Cross-tenant data leakage due to missing filters** → *Mitigation:* We must implement strict validation in backend Repositories. In V1-MVP, we will enforce `tenant_id` checks on all operations inside repository methods. In V2+, we will evaluate automatic query injection via Prisma Client extensions.
* **[Risk] Schema modifications breaking running services** → *Mitigation:* Prisma migrations must follow backward-compatible practices (e.g. nullable fields on new columns, default values) and each migration must document a rollback plan in SQL.
* **[Risk] Development data pollution** → *Mitigation:* Ensure `prisma/seed.ts` is idempotent and clear instructions for running migrations cleanly.
