# Shared Tooling Config

## Purpose

Define as configurações de qualidade de código centralizadas no package `@linguoup/config`: ESLint flat config TypeScript-aware, TSConfig base e Prettier config. Todos os apps e packages do monorepo estendem estas configurações para garantir consistência.

## Requirements

### Requirement: Shared ESLint configuration
The `packages/config` package SHALL export a shared ESLint flat config (`eslint.config.js`) that all apps and packages extend, enforcing TypeScript-aware rules consistently across the monorepo.

#### Scenario: App extends shared ESLint config
- **WHEN** `apps/api/eslint.config.js` imports from `@linguoup/config/eslint`
- **THEN** running `pnpm lint --filter=api` applies all shared rules without requiring per-app rule duplication

#### Scenario: Lint catches TypeScript errors
- **WHEN** a developer introduces a TypeScript-aware lint violation (e.g., `any` without explicit annotation)
- **THEN** `pnpm lint` exits with a non-zero code and reports the violation with file and line number

### Requirement: Shared TypeScript base configuration
The `packages/config` package SHALL export a `tsconfig.base.json` that all apps and packages extend, defining common compiler options (`strict: true`, `target`, `module`, `paths`).

#### Scenario: App extends base TSConfig
- **WHEN** `apps/api/tsconfig.json` extends `@linguoup/config/tsconfig.base.json`
- **THEN** `pnpm typecheck --filter=api` applies strict TypeScript checks without errors on a clean scaffold

#### Scenario: Path aliases resolve correctly
- **WHEN** `tsconfig.base.json` defines a path alias (e.g., `@/*`)
- **THEN** TypeScript resolves the alias without errors during typecheck

### Requirement: Shared Prettier configuration
The `packages/config` package SHALL export a `prettier.config.js` used by all apps and packages for consistent code formatting.

#### Scenario: Prettier formats code consistently
- **WHEN** a developer runs `pnpm format` (or Prettier via ESLint plugin)
- **THEN** all files are formatted according to the shared config with no conflicting rules
