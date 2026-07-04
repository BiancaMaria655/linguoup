# web-trail-detail

## Purpose

Defines the requirements for the Trail Detail screen (`/lessons/trail/[id]`), showing the trail header, lesson list with statuses, and navigation to individual lessons.

## Requirements

### Requirement: Detalhe da Trilha lista lições com status via hook useTrailDetail
O sistema SHALL exibir na rota `/lessons/trail/[id]` o cabeçalho da trilha (nome, descrição, progresso visual) e a lista de lições da trilha com seus status (concluída, próxima, bloqueada), consumidos via hook `useTrailDetail(id)`.

#### Scenario: Detalhe da trilha carregado com sucesso
- **WHEN** o usuário navega para `/lessons/trail/[id]` e a API retorna dados da trilha
- **THEN** o sistema exibe nome da trilha, descrição, barra de progresso com percentual, e lista de lições com nome, duração e status de cada lição

#### Scenario: Status das lições reflete progresso do usuário
- **WHEN** uma lição foi concluída pelo usuário
- **THEN** o sistema exibe indicador visual de "concluída" (ex: checkmark verde)
- **WHEN** uma lição é a próxima recomendada
- **THEN** o sistema destaca a lição e exibe botão "Iniciar"
- **WHEN** uma lição está bloqueada (pré-requisito não concluído)
- **THEN** o sistema exibe a lição como desabilitada/bloqueada sem link clicável

#### Scenario: Botão "Iniciar próxima lição" presente quando há lição disponível
- **WHEN** existe uma lição com status "próxima"
- **THEN** o sistema exibe botão "Iniciar próxima lição" que navega para `/lessons/[lessonId]`

#### Scenario: Detalhe em estado de loading
- **WHEN** a resposta da API ainda não chegou
- **THEN** o sistema exibe skeletons para o cabeçalho e para a lista de lições

#### Scenario: Trilha não encontrada
- **WHEN** a API retorna 404 para o id da trilha
- **THEN** o sistema exibe mensagem de erro e link para voltar ao catálogo
