# web-trail-catalog

## Purpose

Defines the requirements for the Trail Catalog screen (`/lessons`), allowing authenticated users to browse and filter available learning trails by level.

## Requirements

### Requirement: Catálogo de Trilhas lista trilhas filtradas por nível via hook useLessons
O sistema SHALL exibir na rota `/lessons` a lista de trilhas de aprendizado consumida via hook `useLessons(filter)`, com filtro por nível (Todos, Iniciante, Intermediário, Avançado), mostrando para cada trilha: ícone, título, badge de nível, descrição resumida, barra de progresso e contador de lições concluídas/total.

#### Scenario: Catálogo carregado com sucesso
- **WHEN** o usuário autenticado acessa `/lessons` e a API `/lessons/trails` retorna trilhas
- **THEN** o sistema exibe a lista de trilhas com ícone, título, badge de nível, descrição (max 2 linhas), barra de progresso e contagem de lições

#### Scenario: Filtro por nível aplicado
- **WHEN** o usuário seleciona um filtro de nível (ex: "Iniciante")
- **THEN** o sistema recarrega a lista chamando `/lessons/trails?level=beginner` e exibe apenas trilhas do nível selecionado

#### Scenario: Catálogo em estado de loading
- **WHEN** a resposta da API ainda não chegou
- **THEN** o sistema exibe 3 skeletons de 100px de altura no lugar das trilhas

#### Scenario: Nenhuma trilha encontrada para o filtro
- **WHEN** a API retorna lista vazia para o filtro aplicado
- **THEN** o sistema exibe mensagem "Nenhuma trilha encontrada." com ícone 📚

#### Scenario: Cada trilha é clicável e navega para o detalhe
- **WHEN** o usuário clica em um card de trilha
- **THEN** o sistema navega para `/lessons/trail/[id]` da trilha selecionada
