## Context

O LinguoUp é um novo produto — não existe repositório nem codebase anterior. Esta mudança cria a fundação técnica do monorepo a partir do zero. O objetivo é estabelecer a estrutura de pastas, ferramentas compartilhadas de qualidade (ESLint, Prettier, TypeScript) e scaffolds vazios das três aplicações (`api`, `mobile`, `web`) e três packages (`ui`, `config`, `database`), com ambiente Docker local funcional.

Todos os artefatos criados aqui são pré-requisito para qualquer mudança subsequente (CHG-002 em diante). Não existe risco de quebra de funcionalidade existente — o risco é criar uma estrutura incompatível que dificulte futuras mudanças.

**Stakeholders:** time de desenvolvimento (desenvolvedores humanos + agentes de IA).

**Restrições:**
- Package manager: `pnpm` (workspaces)
- Node.js: LTS (v20+)
- TypeScript em todos os packages e apps
- ESLint + Prettier centralizados em `packages/config`
- Sem lógica de negócio nesta mudança

## Goals / Non-Goals

**Goals:**
- Criar estrutura de monorepo funcional com `pnpm workspaces`
- Centralizar configurações de qualidade em `packages/config`
- Scaffoldar `apps/api` (NestJS), `apps/web` (Next.js App Router), `apps/mobile` (React Native + Expo) com o mínimo necessário para buildar
- Scaffoldar `packages/ui` e `packages/database` como packages vazios prontos para receber conteúdo
- Prover `docker-compose.yml` com PostgreSQL 15, Redis 7 e pgAdmin
- Documentar setup no `README.md`
- Scripts raiz funcionais: `dev`, `build`, `lint`, `typecheck`, `test`

**Non-Goals:**
- Nenhuma lógica de produto ou negócio
- Schema de banco de dados (CHG-003)
- Autenticação (CHG-004+)
- CI/CD e infraestrutura (CHG-002)
- Telas ou componentes de UI
- Deploy em qualquer ambiente

## Decisions

### Decisão 1: pnpm workspaces como gerenciador de monorepo

**Escolhido:** `pnpm workspaces` (nativo ao pnpm)

**Alternativas consideradas:**
- Turborepo: boa opção para caching de builds, mas adiciona complexidade desnecessária no MVP. Pode ser adicionado depois.
- Nx: mais complexo, overhead de configuração elevado para o estágio atual do projeto.
- Lerna: legado, substituído por soluções mais modernas.

**Rationale:** pnpm já é o gerenciador definido na stack. Workspaces nativos cobrem todos os requisitos do MVP sem dependências adicionais. Turborepo pode ser integrado posteriormente sem breaking changes.

---

### Decisão 2: Configurações compartilhadas centralizadas em `packages/config`

**Escolhido:** Pacote `@linguoup/config` exportando ESLint flat config, TSConfig base e Prettier config.

**Alternativas consideradas:**
- Cada app com sua própria config: gera divergência e duplicação ao longo do tempo.
- Configs na raiz do monorepo e extendidas por cada app: menos isolado, mais difícil de versionar por package.

**Rationale:** Centralização garante consistência. Mudanças de qualidade são aplicadas em um único lugar e propagadas para todos os apps via `extends`.

---

### Decisão 3: Scaffolds mínimos para cada app

**Escolhido:** Criar apenas a estrutura mínima necessária para cada app compilar e rodar — sem páginas, rotas ou módulos de negócio.

| App | Ferramenta de scaffold | Versão |
|-----|------------------------|--------|
| `apps/api` | `@nestjs/cli` | NestJS 10+ |
| `apps/web` | `create-next-app` | Next.js 14+ App Router |
| `apps/mobile` | `create-expo-app` | Expo SDK 51+ |

**Rationale:** Usar ferramentas oficiais de scaffold evita configuração manual propensa a erro e garante estrutura recomendada pelos maintainers de cada framework.

---

### Decisão 4: Docker Compose com PostgreSQL 15, Redis 7 e pgAdmin

**Escolhido:** `docker-compose.yml` com 3 serviços: `postgres`, `redis`, `pgadmin`.

**Alternativas consideradas:**
- Banco local sem Docker: dificulta onboarding e reprodutibilidade.
- Docker sem pgAdmin: pgAdmin facilita inspeção visual do banco durante desenvolvimento.

**Rationale:** Ambiente local padronizado via Docker garante reprodutibilidade entre máquinas e é pré-requisito para `pnpm db:migrate` nas mudanças seguintes.

---

### Decisão 5: `.env.example` como fonte de verdade de variáveis

**Escolhido:** Arquivo `.env.example` na raiz com todas as variáveis necessárias documentadas, sem valores reais.

**Rationale:** Evita que segredos sejam versionados. O desenvolvedor copia para `.env` localmente. `.env` permanece no `.gitignore`.

## Risks / Trade-offs

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Versões de frameworks desatualizadas ao longo do tempo | Médio — breaking changes em dependências | Dependabot configurado no CHG-002 (CI/CD) |
| Peer dependency conflicts entre packages do monorepo | Baixo — comum em monorepos híbridos (Node + React Native) | Usar `pnpm overrides` para resolver conflitos; testar `pnpm install` sem erros |
| Expo e React Native exigindo configs específicas do workspace | Médio — Metro bundler não resolve packages fora de `node_modules` por padrão | Configurar `metro.config.js` com `watchFolders` apontando para `packages/` |
| TSConfig paths não resolvidos em tempo de build | Baixo | Configurar `paths` no `tsconfig.base.json` e validar com `pnpm typecheck` |
| Docker Compose porta já em uso na máquina do dev | Baixo | Documentar portas no README; variáveis de porta no `.env.example` |

## Migration Plan

Esta mudança cria estrutura do zero — não há migração de sistema legado.

**Sequência de execução:**
1. Criar `pnpm-workspace.yaml` e `package.json` raiz
2. Criar `packages/config` com ESLint, TSConfig e Prettier
3. Scaffoldar `packages/ui` e `packages/database` (estrutura vazia)
4. Scaffoldar `apps/api`, `apps/web`, `apps/mobile`
5. Criar `docker-compose.yml` e `.env.example`
6. Atualizar `README.md`
7. Executar critério de conclusão: `pnpm install && pnpm lint && pnpm typecheck && pnpm build`

**Rollback:** Remover o repositório/branch. Não há estado externo (banco, infra) afetado.

## Open Questions

- **Turborepo no MVP?** Incluir Turborepo para cache de builds desde o início simplifica o pipeline no CHG-002. Decisão adiada para CHG-002 (CI/CD) para não atrasar esta mudança.
- **Versão do Expo SDK:** SDK 51 (estável) ou SDK 52 (mais recente)? Preferir SDK mais recente com suporte ativo — validar compatibilidade com NativeWind antes de scaffoldar.
