# CHG-001 — Monorepo Setup & Infraestrutura Base

## Versão do Roadmap
**V1 — MVP**

## Descrição
Inicialização do monorepo com pnpm workspaces, configuração das ferramentas de desenvolvimento (ESLint, Prettier, TypeScript) e scaffold das três aplicações (`api`, `mobile`, `web`). Nenhuma funcionalidade de produto é entregue — o objetivo é criar a fundação técnica que permite todas as mudanças subsequentes.

## Contexto
O projeto LinguoUp é um monorepo com três apps (`apps/api`, `apps/mobile`, `apps/web`) e três packages compartilhados (`packages/ui`, `packages/config`, `packages/database`). Esta mudança estabelece a estrutura de pastas, configurações compartilhadas e scripts de desenvolvimento, sem nenhuma lógica de negócio.

## Escopo

### O que está incluído
- Inicialização do `pnpm-workspace.yaml`
- `packages/config`: ESLint config, TSConfig base, Prettier config
- Scaffold de `apps/api` (NestJS vazio)
- Scaffold de `apps/web` (Next.js App Router vazio)
- Scaffold de `apps/mobile` (React Native + Expo vazio)
- `packages/ui`: package vazio com estrutura base
- `packages/database`: package vazio com estrutura base
- `docker-compose.yml` com PostgreSQL 15, Redis 7 e pgAdmin
- `.env.example` com variáveis necessárias documentadas
- Scripts raiz: `dev`, `build`, `lint`, `typecheck`, `test`
- `README.md` atualizado com instruções de setup

### Non-goals
- Nenhuma lógica de negócio ou funcionalidade de produto
- Nenhum schema de banco de dados
- Nenhuma autenticação
- Nenhuma tela ou componente de UI
- Deploy ou CI/CD (CHG-002)

## Arquivos Afetados

### [NEW] `pnpm-workspace.yaml`
### [NEW] `package.json` (raiz)
### [NEW] `packages/config/package.json`
### [NEW] `packages/config/eslint.config.js`
### [NEW] `packages/config/tsconfig.base.json`
### [NEW] `packages/config/prettier.config.js`
### [NEW] `packages/ui/package.json`
### [NEW] `packages/database/package.json`
### [NEW] `apps/api/` — scaffold NestJS vazio
### [NEW] `apps/web/` — scaffold Next.js vazio
### [NEW] `apps/mobile/` — scaffold React Native/Expo vazio
### [NEW] `docker-compose.yml`
### [NEW] `.env.example`
### [MODIFY] `README.md`

## Tamanho, Complexidade e Risco
| Dimensão    | Avaliação | Justificativa |
|-------------|-----------|---------------|
| Tamanho     | Médio     | Múltiplos arquivos, mas sem lógica complexa |
| Complexidade| Baixa     | Configuração padrão de monorepo pnpm |
| Risco       | Baixo     | Nenhuma lógica de negócio; reversível facilmente |

## Plano de Verificação
```bash
pnpm install
pnpm lint && pnpm typecheck && pnpm build
docker compose up -d
# Verificar que PostgreSQL e Redis sobem sem erros
```
