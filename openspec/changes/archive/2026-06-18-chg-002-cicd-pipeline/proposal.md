# CHG-002 — CI/CD Pipeline & Docker Base

## Versão do Roadmap
**V1 — MVP**

## Descrição
Configuração do pipeline de CI/CD com GitHub Actions e dos Dockerfiles de produção para as três aplicações. A pipeline segue o fluxo: Build → Testes → SAST → Deploy Staging → Aprovação → Produção. Esta mudança garante qualidade automatizada desde o início do projeto.

## Contexto
Dependência: CHG-001 (monorepo setup) deve estar concluído. Esta mudança cria a camada de automação que valida toda mudança futura antes de chegar à produção.

## Escopo

### O que está incluído
- `.github/workflows/ci.yml`: lint, typecheck, test para todos os apps em PR
- `.github/workflows/cd-staging.yml`: build + push de imagens Docker para staging ao merge em `develop`
- `.github/workflows/cd-production.yml`: deploy em produção após aprovação manual
- `apps/api/Dockerfile` (multi-stage: builder + runner)
- `apps/web/Dockerfile` (multi-stage: builder + runner)
- `apps/mobile/` — apenas workflow de build Expo EAS (sem Docker)
- `.github/workflows/security.yml`: SonarQube SAST + Trivy container scanning
- Configuração de `Dependabot` para atualizações de dependências

### Non-goals
- Infraestrutura AWS (Terraform — CHG-003)
- Kubernetes manifests (CHG-003)
- Secrets reais de produção (apenas variáveis de ambiente documentadas)
- Deploy efetivo para AWS (pipeline fica configurada mas sem destino real até CHG-003)

## Arquivos Afetados

### [NEW] `.github/workflows/ci.yml`
### [NEW] `.github/workflows/cd-staging.yml`
### [NEW] `.github/workflows/cd-production.yml`
### [NEW] `.github/workflows/security.yml`
### [NEW] `.github/dependabot.yml`
### [NEW] `apps/api/Dockerfile`
### [NEW] `apps/web/Dockerfile`
### [NEW] `.dockerignore` (raiz e por app)

## Tamanho, Complexidade e Risco
| Dimensão    | Avaliação | Justificativa |
|-------------|-----------|---------------|
| Tamanho     | Médio     | Múltiplos workflows, mas cada um é direto |
| Complexidade| Média     | Integração com ferramentas externas (SonarQube, Trivy) |
| Risco       | Baixo     | Não afeta código de produção; apenas automação |

## Plano de Verificação
- Abrir PR de teste e verificar que CI executa lint + typecheck + test
- Verificar que Dependabot cria PRs de atualização de dependências
- Revisar logs do SonarQube e Trivy nos artefatos do GitHub Actions
