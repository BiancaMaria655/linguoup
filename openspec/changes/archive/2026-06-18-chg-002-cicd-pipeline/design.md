## Context

O projeto LinguoUp é um monorepo pnpm com três aplicações (`apps/api`, `apps/web`, `apps/mobile`) e pacotes compartilhados (`packages/*`). Atualmente, não há nenhuma automação de CI/CD: toda validação de qualidade é manual e dependente do desenvolvedor lembrar de rodar `pnpm lint && pnpm typecheck && pnpm test && pnpm build` antes de fazer merge.

A mudança CHG-001 estabeleceu o monorepo. Esta mudança (CHG-002) cria a camada de automação que garante que cada PR e cada merge seja validado automaticamente antes de atingir staging ou produção.

**Stakeholders:** Desenvolvedores (feedback rápido em PRs), DevOps (deploy confiável), Produto (garantia de qualidade antes do lançamento do MVP).

**Restrições:**
- Não há infraestrutura AWS ainda (CHG-003 cuida disso); pipelines de CD ficam configuradas mas sem destino real em produção.
- Segredos reais de produção não serão versionados; apenas variáveis de ambiente documentadas com placeholders.
- Mobile (React Native / Expo) não tem imagem Docker; apenas build EAS via GitHub Actions.

---

## Goals / Non-Goals

**Goals:**
- Pipeline de CI que executa lint + typecheck + testes em todo PR, para todos os apps do monorepo.
- Workflows de CD para staging (merge em `develop`) e produção (aprovação manual após staging).
- Dockerfiles multi-stage otimizados para `api` e `web` (menor imagem possível em produção).
- Workflow de segurança com SAST (SonarQube) e container scanning (Trivy).
- Configuração de Dependabot para atualizações automáticas de dependências.

**Non-Goals:**
- Provisionamento de infraestrutura AWS (Terraform — CHG-003).
- Manifests Kubernetes (CHG-003).
- Deploy efetivo para AWS (pipelines preparadas mas sem destino real até CHG-003).
- Secrets reais de produção (apenas variáveis documentadas).
- Cobertura de testes E2E no CI (será adicionada em mudança futura).

---

## Decisions

### D1: GitHub Actions como plataforma de CI/CD
**Decisão:** Usar GitHub Actions (já definido na spec técnica).  
**Alternativas consideradas:** GitLab CI, CircleCI.  
**Rationale:** O repositório já está no GitHub. GitHub Actions é nativo, sem custo adicional para repositórios públicos/privados no tier básico, e tem integração direta com PRs, environments e secrets.

### D2: Dockerfiles multi-stage para `api` e `web`
**Decisão:** Cada app tem seu próprio Dockerfile multi-stage (`builder` + `runner`) com imagem base Alpine/distroless no runner.  
**Alternativas consideradas:** Imagem única sem multi-stage; build no host e cópia do artefato.  
**Rationale:** Multi-stage separa ferramentas de build de dependências de runtime, resultando em imagens menores (~50–70% menores) e superficie de ataque reduzida. Crítico para segurança e performance de pull em Kubernetes.

### D3: Separação de workflows por responsabilidade
**Decisão:** Três workflows distintos: `ci.yml` (qualidade em PRs), `cd-staging.yml` (deploy em staging no push para `develop`), `cd-production.yml` (deploy em produção com aprovação manual).  
**Alternativas consideradas:** Um workflow único com jobs condicionais.  
**Rationale:** Separação de responsabilidades. Cada workflow tem triggers, permissões e environments distintos. Reduz o risco de um bug no CD acidentalmente bloquear o CI.

### D4: Aprovação manual para produção via GitHub Environments
**Decisão:** Usar `environment: production` com proteção de revisão obrigatória no GitHub.  
**Alternativas consideradas:** Branch protection rules, tag-based release.  
**Rationale:** GitHub Environments oferecem aprovação nativa, histórico de deploys e secrets escopados por environment, sem ferramentas adicionais.

### D5: Filtro de paths no CI para otimização de tempo
**Decisão:** Usar `paths` no CI para só rodar jobs afetados quando arquivos de um app específico mudam.  
**Alternativas consideradas:** Sempre rodar tudo.  
**Rationale:** Reduz tempo de feedback em PRs que tocam apenas um app. pnpm workspaces com `--filter` torna isso direto.

### D6: pnpm cache no CI
**Decisão:** Usar `actions/setup-node` com `cache: 'pnpm'` e o step de `pnpm store path` para cache de dependências.  
**Rationale:** Reduz `pnpm install` de ~2min para ~15s em runs subsequentes.

---

## Risks / Trade-offs

| Risco | Mitigação |
|-------|-----------|
| SonarQube requer servidor externo ou SonarCloud | Usar SonarCloud (plano gratuito para OSS) ou substituir por CodeQL (nativo GitHub) no MVP; documentar como opcional |
| Trivy pode bloquear o pipeline por CVEs em dependências indiretas | Configurar `--severity HIGH,CRITICAL` e `--exit-code 0` inicialmente (apenas relatório); upgrade para `--exit-code 1` após estabilização |
| Secrets do registry Docker (ECR) não existem até CHG-003 | Jobs de CD que fazem push para ECR são scaffolados mas têm step condicional `if: secrets.ECR_REGISTRY != ''` para não falhar |
| Expo EAS build requer token de autenticação | Documentar `EXPO_TOKEN` como secret necessário; job de mobile build fica como `manual` no staging até token configurado |
| Tempo de CI longo em monorepos grandes | Filtros de path + pnpm `--filter` + cache de dependências limitam o impacto |

---

## Migration Plan

1. **Criar `.github/` structure** com todos os workflows e Dependabot config.
2. **Criar Dockerfiles** em `apps/api/` e `apps/web/` e `.dockerignore` nos locais corretos.
3. **Configurar GitHub Environments** no repositório: `staging` e `production` com proteção de revisão (manual — fora do código, feito na UI do GitHub).
4. **Configurar secrets** no GitHub: `SONAR_TOKEN`, `EXPO_TOKEN` (documentados no README; valores reais adicionados manualmente).
5. **Abrir PR de smoke test** para validar que o CI executa corretamente.
6. **Rollback:** Como os workflows são arquivos versionados no Git, rollback é um `git revert` do commit. Não há estado externo para desfazer (exceto environments do GitHub, que são idempotentes).

---

## Open Questions

- **SonarQube vs. CodeQL:** Preferência por SonarCloud (gratuito para OSS) ou GitHub CodeQL (100% nativo, sem server)? CodeQL é mais simples de configurar para o MVP.
- **Registry Docker:** ECR (AWS, CHG-003) ou GHCR (GitHub Container Registry, gratuito para pacotes públicos)? GHCR seria mais simples para o MVP antes do CHG-003.
- **Node.js version:** Fixar em `20` (LTS atual) ou ler do `.nvmrc`/`engines` do `package.json`?
