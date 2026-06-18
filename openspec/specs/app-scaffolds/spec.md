# App Scaffolds

## Purpose

Define os scaffolds mínimos das três aplicações (`apps/api`, `apps/web`, `apps/mobile`) e dos dois packages compartilhados (`packages/ui`, `packages/database`). Cada scaffold deve compilar e rodar sem lógica de negócio, prontos para receber implementação nas mudanças subsequentes.

## Requirements

### Requirement: NestJS API scaffold
The `apps/api` directory SHALL contain a minimal NestJS application scaffold (App Module + main.ts) that compiles and starts successfully, with no business logic.

#### Scenario: API scaffold builds without errors
- **WHEN** a developer runs `pnpm build --filter=api`
- **THEN** the build exits with code 0 and produces compiled output in `apps/api/dist/`

#### Scenario: API scaffold starts successfully
- **WHEN** a developer runs `pnpm dev --filter=api`
- **THEN** NestJS starts on the configured port (default 3000) and logs "Application is running"

### Requirement: Next.js Web Admin scaffold
The `apps/web` directory SHALL contain a minimal Next.js App Router scaffold with a root layout and home page, with no business logic.

#### Scenario: Web scaffold builds without errors
- **WHEN** a developer runs `pnpm build --filter=web`
- **THEN** Next.js build exits with code 0 and produces output in `apps/web/.next/`

#### Scenario: Web scaffold starts in dev mode
- **WHEN** a developer runs `pnpm dev --filter=web`
- **THEN** Next.js dev server starts on the configured port (default 3001) without errors

### Requirement: React Native mobile scaffold
The `apps/mobile` directory SHALL contain a minimal React Native + Expo scaffold with a root screen, configured with NativeWind and Metro resolving workspace packages.

#### Scenario: Mobile scaffold starts with Expo
- **WHEN** a developer runs `pnpm dev --filter=mobile`
- **THEN** Expo starts the dev server and Metro bundler resolves `packages/*` via `watchFolders` without errors

#### Scenario: Metro resolves workspace packages
- **WHEN** `apps/mobile/metro.config.js` configures `watchFolders` to include the monorepo root
- **THEN** importing from `@linguoup/ui` in mobile code resolves correctly without "module not found" errors

### Requirement: Shared UI package scaffold
The `packages/ui` directory SHALL contain a minimal package scaffold (`package.json` with `name: @linguoup/ui`) ready to receive shared React Native + React components, with no components yet.

#### Scenario: UI package is recognized by workspace
- **WHEN** a developer runs `pnpm install` at the root
- **THEN** `@linguoup/ui` is resolvable as a workspace package from any app

### Requirement: Shared database package scaffold
The `packages/database` directory SHALL contain a minimal package scaffold (`package.json` with `name: @linguoup/database`) ready to receive Prisma schema and client exports, with no schema yet.

#### Scenario: Database package is recognized by workspace
- **WHEN** a developer runs `pnpm install` at the root
- **THEN** `@linguoup/database` is resolvable as a workspace package from any app
