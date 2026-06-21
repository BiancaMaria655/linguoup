## ADDED Requirements

### Requirement: Dockerfile multi-stage para `apps/api`
O sistema SHALL ter um `apps/api/Dockerfile` com dois estágios: `builder` (instala dependências de dev e compila TypeScript) e `runner` (imagem mínima de produção com apenas os artefatos compilados e dependências de produção).

#### Scenario: Build da imagem de api bem-sucedido
- **WHEN** `docker build -t linguoup-api .` é executado a partir de `apps/api/`
- **THEN** o estágio `builder` instala todas as dependências e compila o TypeScript sem erros
- **THEN** o estágio `runner` copia apenas os artefatos de `dist/` e `node_modules` de produção
- **THEN** a imagem final tem tamanho menor que 500MB
- **THEN** `docker run linguoup-api` inicia o servidor NestJS na porta `3000`

#### Scenario: Imagem runner não contém devDependencies
- **WHEN** a imagem `runner` é inspecionada
- **THEN** o diretório `node_modules` contém apenas dependências de produção (`pnpm install --prod`)
- **THEN** arquivos de código fonte TypeScript (`.ts`) não estão presentes

### Requirement: Dockerfile multi-stage para `apps/web`
O sistema SHALL ter um `apps/web/Dockerfile` com estágios `builder` (instala dependências e executa `next build`) e `runner` (imagem mínima com o output standalone do Next.js).

#### Scenario: Build da imagem de web bem-sucedido
- **WHEN** `docker build -t linguoup-web .` é executado a partir de `apps/web/`
- **THEN** o estágio `builder` executa `next build` sem erros
- **THEN** o estágio `runner` usa o output `standalone` do Next.js
- **THEN** a imagem final tem tamanho menor que 300MB
- **THEN** `docker run -p 3001:3001 linguoup-web` serve a aplicação Next.js

#### Scenario: Next.js configurado com output standalone
- **WHEN** `apps/web/next.config.js` (ou `.ts`) é verificado
- **THEN** a propriedade `output: 'standalone'` está configurada
- **THEN** o build gera o diretório `.next/standalone` com todos os arquivos necessários

### Requirement: Arquivos `.dockerignore` configurados
O sistema SHALL ter arquivos `.dockerignore` na raiz do monorepo e em cada app Dockerizado para excluir arquivos desnecessários do contexto de build.

#### Scenario: .dockerignore exclui node_modules e artefatos de dev
- **WHEN** o contexto de build Docker é enviado para o daemon
- **THEN** os diretórios `node_modules`, `.next`, `dist`, `.env*` e arquivos de desenvolvimento estão excluídos
- **THEN** o tempo de envio do contexto é menor que 5 segundos em uma conexão local
