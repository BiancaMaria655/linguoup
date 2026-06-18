## 1. Raiz do Monorepo

- [x] 1.1 Criar `pnpm-workspace.yaml` na raiz definindo `apps/*` e `packages/*` como workspaces
- [x] 1.2 Criar `package.json` raiz com `name: linguoup`, `private: true` e scripts: `dev`, `build`, `lint`, `typecheck`, `test` usando `pnpm --filter`
- [x] 1.3 Criar `.gitignore` cobrindo `node_modules`, `dist`, `.next`, `.env`, `*.log`, `coverage`
- [x] 1.4 Criar `.npmrc` com `shamefully-hoist=false` e `strict-peer-dependencies=false` para compatibilidade com React Native

## 2. Package: @linguoup/config

- [x] 2.1 Criar `packages/config/package.json` com `name: @linguoup/config`, `private: true`, e exports para `eslint`, `tsconfig`, `prettier`
- [x] 2.2 Instalar devDependências: `typescript`, `eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint-config-prettier`, `prettier`
- [x] 2.3 Criar `packages/config/tsconfig.base.json` com `strict: true`, `target: ES2022`, `module: CommonJS`, `moduleResolution: bundler`, `esModuleInterop: true`
- [x] 2.4 Criar `packages/config/eslint.config.js` como ESLint flat config exportando regras TypeScript-aware com integração Prettier
- [x] 2.5 Criar `packages/config/prettier.config.js` com configuração Prettier padrão (singleQuote, semi, printWidth: 100)

## 3. Package: @linguoup/ui

- [x] 3.1 Criar `packages/ui/package.json` com `name: @linguoup/ui`, `private: true`, e `main: index.ts`
- [x] 3.2 Criar `packages/ui/tsconfig.json` extendendo `@linguoup/config/tsconfig.base.json`
- [x] 3.3 Criar `packages/ui/index.ts` vazio com comentário indicando que componentes compartilhados serão adicionados em mudanças futuras

## 4. Package: @linguoup/database

- [x] 4.1 Criar `packages/database/package.json` com `name: @linguoup/database`, `private: true`, e `main: index.ts`
- [x] 4.2 Criar `packages/database/tsconfig.json` extendendo `@linguoup/config/tsconfig.base.json`
- [x] 4.3 Criar `packages/database/index.ts` vazio com comentário indicando que Prisma schema e client serão adicionados no CHG-003

## 5. App: apps/api (NestJS)

- [x] 5.1 Scaffoldar `apps/api` com `@nestjs/cli` usando `nest new api --package-manager pnpm --skip-git`
- [x] 5.2 Atualizar `apps/api/tsconfig.json` para estender `@linguoup/config/tsconfig.base.json`
- [x] 5.3 Criar `apps/api/eslint.config.js` importando a config de `@linguoup/config/eslint`
- [x] 5.4 Verificar que `pnpm build --filter=api` passa sem erros
- [x] 5.5 Verificar que `pnpm dev --filter=api` inicia o servidor NestJS sem erros

## 6. App: apps/web (Next.js)

- [x] 6.1 Scaffoldar `apps/web` com `create-next-app` usando App Router, TypeScript, Tailwind CSS e sem src directory
- [x] 6.2 Atualizar `apps/web/tsconfig.json` para estender `@linguoup/config/tsconfig.base.json`
- [x] 6.3 Criar `apps/web/eslint.config.js` importando a config de `@linguoup/config/eslint`
- [x] 6.4 Configurar porta `3001` no script `dev` do `apps/web/package.json` para não conflitar com a API
- [x] 6.5 Verificar que `pnpm build --filter=web` passa sem erros

## 7. App: apps/mobile (React Native + Expo)

- [x] 7.1 Scaffoldar `apps/mobile` com `create-expo-app` usando TypeScript template
- [x] 7.2 Instalar e configurar NativeWind seguindo documentação oficial
- [x] 7.3 Criar `apps/mobile/metro.config.js` com `watchFolders` apontando para a raiz do monorepo para resolver `packages/*`
- [x] 7.4 Atualizar `apps/mobile/tsconfig.json` para estender `@linguoup/config/tsconfig.base.json`
- [x] 7.5 Criar `apps/mobile/eslint.config.js` importando a config de `@linguoup/config/eslint`
- [x] 7.6 Verificar que `pnpm dev --filter=mobile` inicia Metro bundler sem erros de resolução de módulos

## 8. Infraestrutura Local (Docker)

- [x] 8.1 Criar `docker-compose.yml` com serviço `postgres` (imagem `postgres:15`, porta `5432`, healthcheck)
- [x] 8.2 Adicionar serviço `redis` ao `docker-compose.yml` (imagem `redis:7-alpine`, porta `6379`)
- [x] 8.3 Adicionar serviço `pgadmin` ao `docker-compose.yml` (imagem `dpage/pgadmin4`, porta `5050`)
- [x] 8.4 Configurar todos os serviços Docker para ler credenciais via variáveis de ambiente (não hardcoded)
- [x] 8.5 Criar `.env.example` com todas as variáveis: `DATABASE_URL`, `REDIS_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `PGADMIN_EMAIL`, `PGADMIN_PASSWORD`, e portas customizáveis
- [x] 8.6 Verificar que `docker compose up -d` sobe todos os serviços sem erros

## 9. Documentação

- [x] 9.1 Atualizar `README.md` com: pré-requisitos (Node.js LTS, pnpm, Docker), passos de setup (`pnpm install`, `cp .env.example .env`, `docker compose up -d`, `pnpm db:migrate`), e comandos de desenvolvimento

## 10. Verificação Final

- [x] 10.1 Executar `pnpm install` na raiz e confirmar que não há erros de peer dependencies
- [x] 10.2 Executar `pnpm lint` e confirmar saída limpa em todos os packages e apps
- [x] 10.3 Executar `pnpm typecheck` e confirmar que todos os apps compilam sem erros TypeScript
- [x] 10.4 Executar `pnpm build` e confirmar que `apps/api` e `apps/web` buildam sem erros
- [x] 10.5 Executar `docker compose up -d` e verificar que PostgreSQL e Redis iniciam e ficam healthy
