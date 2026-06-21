## 1. Dockerfiles e .dockerignore

- [x] 1.1 Criar `.dockerignore` na raiz do monorepo (excluir `node_modules`, `.next`, `dist`, `.env*`, `*.log`, `.git`)
- [x] 1.2 Criar `apps/api/Dockerfile` multi-stage: estágio `builder` (Node.js LTS, instala deps, compila TypeScript) e estágio `runner` (Alpine, apenas `dist/` e deps de produção)
- [x] 1.3 Criar `apps/web/Dockerfile` multi-stage: estágio `builder` (`next build`) e estágio `runner` (output standalone do Next.js)
- [x] 1.4 Verificar que `apps/web/next.config.ts` (ou `.js`) tem `output: 'standalone'` configurado; adicionar se ausente
- [x] 1.5 Validar localmente: `docker build -t linguoup-api apps/api/` e `docker build -t linguoup-web apps/web/` completam sem erro

## 2. Workflow de CI (`.github/workflows/ci.yml`)

- [x] 2.1 Criar `.github/workflows/ci.yml` com trigger `pull_request` para branches `main` e `develop`
- [x] 2.2 Configurar cache de pnpm store usando `actions/setup-node` com `cache: 'pnpm'`
- [x] 2.3 Adicionar job `lint` que executa `pnpm lint --filter=api --filter=web --filter=mobile`
- [x] 2.4 Adicionar job `typecheck` que executa `pnpm typecheck --filter=api --filter=web --filter=mobile`
- [x] 2.5 Adicionar job `test` que executa `pnpm test --filter=api --filter=web --filter=mobile`
- [x] 2.6 Adicionar job `build` (dependente de lint + typecheck + test) que executa `pnpm build --filter=api --filter=web`
- [x] 2.7 Configurar filtros de path (`paths`) para cada job rodar apenas quando arquivos do app correspondente mudam; `packages/**` dispara todos os jobs
- [x] 2.8 Validar localmente com `act` (opcional) ou abrir PR de smoke test no repositório

## 3. Workflow de CD Staging (`.github/workflows/cd-staging.yml`)

- [x] 3.1 Criar `.github/workflows/cd-staging.yml` com trigger `push` no branch `develop`
- [x] 3.2 Adicionar job `build-images` que constrói imagens Docker de `api` e `web` com tag `develop-${{ github.sha }}`
- [x] 3.3 Adicionar step condicional de push para registry: `if: secrets.ECR_REGISTRY != ''` (placeholder até CHG-003)
- [x] 3.4 Adicionar job `deploy-staging` usando `environment: staging` que executa o deploy (step com placeholder até CHG-003)
- [x] 3.5 Adicionar job `build-mobile-eas` com step condicional `if: secrets.EXPO_TOKEN != ''` que executa `eas build --platform all --non-interactive`

## 4. Workflow de CD Produção (`.github/workflows/cd-production.yml`)

- [x] 4.1 Criar `.github/workflows/cd-production.yml` com trigger manual (`workflow_dispatch`) e push de tag `v*`
- [x] 4.2 Configurar `environment: production` no job de deploy para exigir aprovação manual obrigatória via GitHub Environments
- [x] 4.3 Adicionar job de promoção de imagem de staging para produção (step com placeholder até CHG-003)
- [x] 4.4 Documentar no README como configurar o environment `production` com required reviewers na UI do GitHub

## 5. Workflow de Segurança (`.github/workflows/security.yml`)

- [x] 5.1 Criar `.github/workflows/security.yml` com trigger `pull_request` e `push` para `main`/`develop`
- [x] 5.2 Adicionar job `sonarcloud` usando `SonarSource/sonarcloud-github-action@master` com step condicional `if: secrets.SONAR_TOKEN != ''`
- [x] 5.3 Criar `sonar-project.properties` na raiz com `sonar.projectKey`, `sonar.organization`, `sonar.sources` e `sonar.exclusions`
- [x] 5.4 Adicionar job `trivy-scan` que executa Trivy nas imagens Docker construídas com `--severity HIGH,CRITICAL --exit-code 0` (relatório sem bloqueio no MVP)
- [x] 5.5 Configurar upload do relatório Trivy como artefato do GitHub Actions para rastreabilidade

## 6. Dependabot (`.github/dependabot.yml`)

- [x] 6.1 Criar `.github/dependabot.yml` configurando verificação semanal de `npm` (pnpm) para `apps/api`, `apps/web`, `apps/mobile` e raiz do monorepo
- [x] 6.2 Adicionar verificação semanal de `github-actions` para manter as actions atualizadas
- [x] 6.3 Configurar `assignees` e `reviewers` no Dependabot para PRs automáticos

## 7. Documentação e Secrets

- [x] 7.1 Atualizar `README.md` com seção "CI/CD" documentando: fluxo de branches, secrets necessários (`SONAR_TOKEN`, `EXPO_TOKEN`, `ECR_REGISTRY`), como configurar environments no GitHub e como rodar localmente os checks de CI
- [x] 7.2 Criar `.env.example` com variáveis de ambiente documentadas para os containers Docker (se não existir, adicionar seção de variáveis do Docker)

## 8. Verificação Final

- [x] 8.1 Abrir PR de smoke test para validar que o workflow `ci.yml` executa lint + typecheck + test + build sem erros
- [x] 8.2 Verificar que Dependabot aparece como ativo nas configurações do repositório (GitHub → Security → Dependabot)
- [x] 8.3 Confirmar critério de conclusão local: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`
