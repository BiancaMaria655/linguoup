# Workspace Configuration

## Purpose

Define a configuração do monorepo pnpm: workspace, package.json raiz e npmrc. Garante que todos os apps e packages sejam resolvidos como membros de um único workspace, com scripts delegados via filtros pnpm.

## Requirements

### Requirement: Monorepo workspace configuration
The system SHALL have a `pnpm-workspace.yaml` at the repository root defining the workspace packages so that all apps and packages are resolved by pnpm as a single workspace.

#### Scenario: Workspace packages are recognized
- **WHEN** a developer runs `pnpm install` at the repository root
- **THEN** pnpm resolves all packages under `apps/*` and `packages/*` as workspace members without errors

#### Scenario: Cross-package dependencies resolve locally
- **WHEN** an app (e.g., `apps/api`) declares `@linguoup/config` as a dependency
- **THEN** pnpm resolves it from `packages/config` locally without fetching from the npm registry

### Requirement: Root package.json with workspace scripts
The repository root SHALL have a `package.json` defining scripts `dev`, `build`, `lint`, `typecheck`, and `test` that delegate to the appropriate workspace filters via pnpm.

#### Scenario: Running dev from root starts all apps
- **WHEN** a developer runs `pnpm dev` at the root
- **THEN** all apps with a `dev` script start concurrently

#### Scenario: Running lint from root lints all packages
- **WHEN** a developer runs `pnpm lint` at the root
- **THEN** ESLint runs across all `apps/*` and `packages/*` and exits 0 if no errors
