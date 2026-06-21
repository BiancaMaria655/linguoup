## ADDED Requirements

### Requirement: SAST com SonarCloud no pipeline de CI
O sistema SHALL executar análise estática de código (SAST) via SonarCloud no workflow `.github/workflows/security.yml` em todo PR e push para `main`/`develop`.

#### Scenario: Análise SonarCloud executada com sucesso
- **WHEN** o workflow `security.yml` é disparado em um PR
- **THEN** a action `SonarSource/sonarcloud-github-action` é executada
- **THEN** o relatório de análise é publicado no SonarCloud
- **THEN** o Quality Gate do SonarCloud é verificado no PR como check de status

#### Scenario: Quality Gate falha
- **WHEN** o código introduz vulnerabilidades de nível `BLOCKER` ou `CRITICAL` no SonarCloud
- **THEN** o check `SonarCloud` falha no PR
- **THEN** o merge pode ser bloqueado se a branch protection rule exigir esse check

#### Scenario: Token SonarCloud não configurado
- **WHEN** o secret `SONAR_TOKEN` não está configurado no GitHub
- **THEN** o job SonarCloud é pulado com log explicativo
- **THEN** os outros jobs do security workflow continuam normalmente

### Requirement: Container scanning com Trivy
O sistema SHALL executar scanning de vulnerabilidades nas imagens Docker com Trivy no workflow de CD, após o build das imagens.

#### Scenario: Trivy escaneia imagem sem vulnerabilidades críticas
- **WHEN** a imagem Docker de `api` ou `web` é construída com sucesso
- **THEN** `trivy image --severity HIGH,CRITICAL linguoup-api:tag` é executado
- **THEN** o relatório de vulnerabilidades é publicado como artefato do GitHub Actions
- **THEN** se não houver vulnerabilidades CRITICAL, o job completa com sucesso

#### Scenario: Trivy encontra vulnerabilidade CRITICAL
- **WHEN** a imagem tem uma vulnerabilidade de nível CRITICAL
- **THEN** o relatório é publicado com a CVE identificada
- **THEN** na fase MVP, o job completa com `--exit-code 0` (relatório sem bloqueio)
- **THEN** uma issue de segurança é aberta automaticamente via GitHub Actions step

### Requirement: Dependabot configurado para GitHub Actions
O sistema SHALL ter `dependabot.yml` configurando verificações semanais de atualização de GitHub Actions (actions) e npm (pnpm).

#### Scenario: Dependabot abre PR para atualização de action
- **WHEN** uma action usada nos workflows lança nova versão
- **THEN** o Dependabot abre PR com a versão atualizada no arquivo `.yml` do workflow
- **THEN** o PR passa pelo CI normalmente
