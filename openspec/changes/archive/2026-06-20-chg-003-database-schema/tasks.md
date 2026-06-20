## 1. Package Structure & Configuration

- [x] 1.1 Create the workspace package directory `packages/database` and define `package.json` with dependencies for Prisma client, Prisma CLI, TypeScript, and database scripts. Critério de conclusão: pnpm lint && pnpm typecheck && pnpm test && pnpm build
- [x] 1.2 Configure `packages/database/tsconfig.json` for the TypeScript compiler and modular exports. Critério de conclusão: pnpm lint && pnpm typecheck && pnpm test && pnpm build
- [x] 1.3 Create `packages/database/src/index.ts` exporting the PrismaClient instance and types. Critério de conclusão: pnpm lint && pnpm typecheck && pnpm test && pnpm build

## 2. Prisma Schema Definition

- [x] 2.1 Initialize Prisma configuration and define the datasource linking to PostgreSQL and generator client. Critério de conclusão: pnpm lint && pnpm typecheck && pnpm test && pnpm build
- [x] 2.2 Define the Role enum (`USER`, `ADMIN`, `SUPER_ADMIN`), `User` model, and `UserPreferences` model with logical multi-tenancy `tenant_id` on User. Critério de conclusão: pnpm lint && pnpm typecheck && pnpm test && pnpm build
- [x] 2.3 Define `Lesson` and `LessonCompletion` models with logical multi-tenancy `tenant_id` on Lesson. Critério de conclusão: pnpm lint && pnpm typecheck && pnpm test && pnpm build
- [x] 2.4 Define `UserProgress`, `Achievement`, and `UserAchievement` models with logical multi-tenancy `tenant_id` on UserProgress. Critério de conclusão: pnpm lint && pnpm typecheck && pnpm test && pnpm build
- [x] 2.5 Define `SpacedReviewItem` and `Notification` models in `schema.prisma`. Critério de conclusão: pnpm lint && pnpm typecheck && pnpm test && pnpm build
- [x] 2.6 Validate the schema relationships and syntax using the Prisma CLI validator. Critério de conclusão: pnpm lint && pnpm typecheck && pnpm test && pnpm build

## 3. Migrations & Rollback Scripting

- [x] 3.1 Create the database migration SQL using Prisma. Critério de conclusão: pnpm lint && pnpm typecheck && pnpm test && pnpm build
- [x] 3.2 Write a documented database rollback SQL script for the initial migration to safely drop all tables. Critério de conclusão: pnpm lint && pnpm typecheck && pnpm test && pnpm build

## 4. Seed Data & Administration Configuration

- [x] 4.1 Write a seed script `packages/database/prisma/seed.ts` inserting 1 test User, 5 sample Lessons with content JSON, and base Achievements. Critério de conclusão: pnpm lint && pnpm typecheck && pnpm test && pnpm build
- [x] 4.2 Configure the database management scripts (`db:migrate`, `db:migrate:dev`, `db:seed`, `db:studio`) in the root `package.json`. Critério de conclusão: pnpm lint && pnpm typecheck && pnpm test && pnpm build
