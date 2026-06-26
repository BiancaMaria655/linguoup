## ADDED Requirements

### Requirement: CI executa em todo Pull Request
O sistema SHALL executar o workflow `.github/workflows/ci.yml` automaticamente em todo Pull Request aberto contra os branches `main` e `develop`. O workflow SHALL rodar lint, typecheck e testes para todos os apps do monorepo.

#### Scenario: PR aberto com código válido
- **WHEN** um desenvolvedor abre ou atualiza um PR para `main` ou `develop`
- **THEN** o GitHub Actions inicia o workflow `ci.yml`
- **THEN** os jobs `lint`, `typecheck` e `test` para `api` e `web` são executados em paralelo
- **THEN** todos os checks retornam status verde no PR

#### Scenario: PR com falha de lint
- **WHEN** um desenvolvedor abre um PR com código que viola as regras de ESLint
- **THEN** o job `lint` falha com saída descritiva dos erros
- **THEN** o merge do PR é bloqueado pela branch protection rule

#### Scenario: PR com falha de typecheck
- **WHEN** um desenvolvedor abre um PR com erro de TypeScript
- **THEN** o job `typecheck` falha com a mensagem de erro do compilador
- **THEN** o merge do PR é bloqueado

#### Scenario: PR com falha de teste
- **WHEN** um desenvolvedor abre um PR em que um teste unitário falha
- **THEN** o job `test` falha com o relatório de testes
- **THEN** o merge do PR é bloqueado

### Requirement: Cache de dependências pnpm no CI
O sistema SHALL usar cache de pnpm store entre runs do CI para reduzir o tempo de instalação de dependências.

#### Scenario: Cache hit em run subsequente
- **WHEN** o workflow CI é executado após um run anterior com as mesmas versões de dependência
- **THEN** o step `pnpm install` completa em menos de 30 segundos
- **THEN** o log indica `cache hit` para o pnpm store

#### Scenario: Cache miss em primeira execução ou mudança de lock file
- **WHEN** o `pnpm-lock.yaml` muda ou é a primeira execução no runner
- **THEN** o pnpm store é reconstituído do zero
- **THEN** o cache é salvo para o próximo run

### Requirement: Filtro de paths por aplicação no CI
O workflow CI SHALL usar filtros de path (`paths`) para otimizar a execução, rodando apenas os jobs afetados por mudanças em arquivos de um app específico.

#### Scenario: Mudança apenas em `apps/api`
- **WHEN** um PR modifica somente arquivos dentro de `apps/api/**`
- **THEN** apenas os jobs relacionados à `api` são executados (lint, typecheck, test da api)
- **THEN** o job de `web` é pulado ou marcado como skipped

#### Scenario: Mudança em `packages/*`
- **WHEN** um PR modifica arquivos em `packages/**`
- **THEN** todos os jobs de todos os apps são executados, pois mudanças em packages afetam todos os apps

### Requirement: Build de validação no CI
O sistema SHALL executar `pnpm build` para todos os apps ao final do workflow de CI como validação de compilação.

#### Scenario: Build bem-sucedido
- **WHEN** lint, typecheck e testes passam
- **THEN** o job `build` é executado em seguida
- **THEN** os artefatos de build são gerados sem erros
- **THEN** o check `build` aparece como verde no PR

#### Scenario: Falha de build após testes passando
- **WHEN** os testes passam mas o build falha (ex: import inválido em bundling)
- **THEN** o job `build` falha com o log do bundler
- **THEN** o merge do PR é bloqueado
