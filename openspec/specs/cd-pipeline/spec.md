## ADDED Requirements

### Requirement: CD para staging ao merge em `develop`
O sistema SHALL executar o workflow `.github/workflows/cd-staging.yml` automaticamente ao merge de qualquer commit no branch `develop`. O workflow SHALL construir imagens Docker de `api` e `web`, publicá-las no registry e realizar o deploy no environment `staging`.

#### Scenario: Merge em `develop` bem-sucedido após CI verde
- **WHEN** um PR com CI verde é mergeado em `develop`
- **THEN** o workflow `cd-staging.yml` é disparado
- **THEN** as imagens Docker de `api` e `web` são construídas com a tag `develop-<sha>`
- **THEN** as imagens são publicadas no registry configurado
- **THEN** o deploy para o environment `staging` é iniciado

#### Scenario: Registry não configurado (CHG-003 pendente)
- **WHEN** o secret `ECR_REGISTRY` não está configurado no GitHub
- **THEN** o step de push para o registry é pulado (`if: secrets.ECR_REGISTRY != ''`)
- **THEN** o workflow completa sem erro, logando que o push foi ignorado

### Requirement: Aprovação manual obrigatória para deploy em produção
O sistema SHALL exigir aprovação manual de um revisor autorizado antes de executar qualquer deploy em produção, via GitHub Environments com proteção de revisão.

#### Scenario: Deploy em produção solicitado após staging aprovado
- **WHEN** o workflow `cd-production.yml` é disparado (ex: push de tag `v*` ou execução manual)
- **THEN** o job de deploy fica em estado `waiting` aguardando aprovação do revisor
- **THEN** o revisor recebe notificação de aprovação pendente no GitHub

#### Scenario: Aprovação concedida
- **WHEN** um revisor autorizado aprova o deploy na UI do GitHub
- **THEN** o job de deploy é executado com as imagens do ambiente staging promovidas para produção
- **THEN** o histórico de aprovação é registrado no GitHub Environment

#### Scenario: Aprovação negada
- **WHEN** um revisor nega o deploy
- **THEN** o job é cancelado
- **THEN** nenhuma alteração é feita em produção



### Requirement: Dependabot configurado para atualizações de dependências
O sistema SHALL ter o Dependabot configurado para verificar atualizações de dependências npm/pnpm e de actions do GitHub semanalmente.

#### Scenario: Dependabot abre PR de atualização de dependência
- **WHEN** uma nova versão de uma dependência é lançada
- **THEN** o Dependabot abre um PR com a atualização
- **THEN** o CI executa no PR do Dependabot normalmente
- **THEN** a atualização pode ser mergeada após aprovação

#### Scenario: Dependabot verifica GitHub Actions
- **WHEN** uma nova versão de uma action usada nos workflows é lançada
- **THEN** o Dependabot abre um PR atualizando a versão da action nos arquivos `.yml`
