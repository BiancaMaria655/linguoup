## ADDED Requirements

### Requirement: Hook useStreakScreen encapsula lógica de streak e meta diária
O sistema SHALL fornecer o hook `useStreakScreen` em `apps/web/app/hooks/useStreakScreen.ts` que encapsula o estado e as mutations de streak, meta diária e modal de alteração de meta. O hook SHALL retornar: `streak`, `bestStreak`, `dailyGoalMinutes`, `showGoalModal`, `newGoal`, `setNewGoal`, `openGoalModal`, `closeGoalModal`, `updateGoal`, `isUpdatingGoal`.

#### Scenario: Abrir modal de alteração de meta
- **WHEN** o usuário clica em "Alterar" na tela de progresso
- **THEN** `showGoalModal` torna-se `true` e `newGoal` é inicializado com o valor atual de `dailyGoalMinutes`

#### Scenario: Salvar nova meta diária
- **WHEN** o usuário confirma a nova meta via `updateGoal(minutes)`
- **THEN** o hook dispara `POST /users/me/onboarding` com `{ dailyGoalMinutes: minutes }` e invalida as queries `["progress"]` e `["home"]`

#### Scenario: Fechar modal sem salvar
- **WHEN** o usuário clica em "Cancelar" ou fora do modal
- **THEN** `showGoalModal` torna-se `false` sem disparar mutation

---

### Requirement: Hook useReviewSession encapsula lógica de sessão de revisão
O sistema SHALL fornecer o hook `useReviewSession` em `apps/web/app/hooks/useReviewSession.ts` que gerencia o estado da sessão de revisão espaçada. O hook SHALL receber `items: ReviewItem[]` e retornar: `sessionIndex`, `sessionActive`, `selected`, `showFeedback`, `scores`, `currentItem`, `handleSelect`, `handleNext`, `startSession`, `endSession`.

#### Scenario: Iniciar sessão de revisão
- **WHEN** o usuário chama `startSession()`
- **THEN** `sessionActive` torna-se `true`, `sessionIndex` é resetado para `0`, `scores` é resetado para `[]`

#### Scenario: Selecionar resposta
- **WHEN** o usuário chama `handleSelect(answer)` com `showFeedback === false`
- **THEN** o hook compara `answer` com `currentItem.correctAnswer` (case-insensitive, trimmed), define `showFeedback = true`, registra o resultado em `scores` e dispara `POST /reviews/:id/complete` com `{ correct: boolean }`

#### Scenario: Avançar para próximo item
- **WHEN** o usuário chama `handleNext()` com `sessionIndex < items.length - 1`
- **THEN** `sessionIndex` incrementa e `showFeedback` e `selected` são resetados

#### Scenario: Concluir sessão
- **WHEN** o usuário chama `handleNext()` no último item
- **THEN** `sessionActive` torna-se `false` e as queries `["reviews"]` e `["home"]` são invalidadas

#### Scenario: Guardar contra duplo-clique
- **WHEN** `handleSelect` é chamado enquanto `showFeedback === true`
- **THEN** a chamada é ignorada sem efeito colateral

---

### Requirement: Página /progress exibe streak, meta e gráfico de atividade via useStreakScreen
A página `/progress` SHALL usar o hook `useStreakScreen` para gerenciar streak e meta diária em vez de lógica inline. O bloco de conquistas SHALL ser removido desta página (movido para `/profile`).

#### Scenario: Renderização inicial com dados carregados
- **WHEN** a página `/progress` é carregada com dados válidos da API
- **THEN** exibe: stats grid (lições, minutos, vocabulário, melhor sequência), gráfico de barras de atividade diária, card de sequência atual, card de meta diária com botão "Alterar" e calendário de atividades dos últimos 30 dias

#### Scenario: Filtrar por período
- **WHEN** o usuário seleciona "7 dias", "30 dias" ou "90 dias"
- **THEN** a query `["progress", period]` é refetchada com `?days=<period>` e o gráfico atualiza

#### Scenario: Estado de loading
- **WHEN** a query de progresso está pendente (`isLoading === true`)
- **THEN** exibe skeleton loaders nos cards de stats e no gráfico

---

### Requirement: Página /reviews exibe lista pendente e inicia sessão via useReviewSession
A página `/reviews` SHALL usar o hook `useReviewSession` em vez de lógica inline. A sessão de revisão SHALL ser renderizada como view separada dentro da mesma rota (não nova rota).

#### Scenario: Lista de revisões pendentes
- **WHEN** a página `/reviews` é carregada com itens pendentes
- **THEN** exibe card de resumo com total e contagem de vencidos, lista de itens com tópico e data de vencimento, botão "Adiar" por item e botão "Revisar agora" habilitado

#### Scenario: Revisão sem itens pendentes
- **WHEN** `data.total === 0`
- **THEN** exibe estado vazio com ícone comemorativo e mensagem "Sem revisões pendentes"

#### Scenario: Botão "Revisar agora" desabilitado
- **WHEN** `data.total === 0`
- **THEN** o botão "Revisar agora" tem `disabled` e opacidade reduzida

#### Scenario: Tela de sessão ativa
- **WHEN** `sessionActive === true`
- **THEN** exibe header com botão fechar, barra de progresso `sessionIndex/total`, pergunta atual e opções (múltipla escolha ou input de texto)

#### Scenario: Tela de resultado da sessão
- **WHEN** a sessão é concluída (`sessionActive` volta para `false`)
- **THEN** exibe contagem de acertos e botão para voltar à lista

---

### Requirement: Página /profile exibe nível XP e grade de conquistas
A página `/profile` SHALL exibir: nível atual do usuário, XP total, barra de progresso para o próximo nível (consumindo `GET /xp`) e grid de conquistas (consumindo `GET /achievements/me`). Conquistas desbloqueadas SHALL ser exibidas em cor; bloqueadas em cinza com opacidade reduzida.

#### Scenario: Renderização com dados carregados
- **WHEN** a página `/profile` é carregada com dados válidos
- **THEN** exibe card de XP com nível, barra de progresso e XP total, seguido do grid de conquistas

#### Scenario: Estado de loading
- **WHEN** as queries de XP ou conquistas estão pendentes
- **THEN** exibe skeleton loaders nos cards correspondentes

#### Scenario: Conquista desbloqueada — hover/tooltip
- **WHEN** o usuário passa o cursor (ou toca) em uma conquista desbloqueada
- **THEN** exibe título e descrição da conquista (via `title` nativo ou tooltip)

#### Scenario: Conquista bloqueada — hover/tooltip
- **WHEN** o usuário passa o cursor (ou toca) em uma conquista bloqueada
- **THEN** exibe o critério necessário para desbloquear (campo `criteria`)

---

### Requirement: Testes unitários para useStreakScreen e useReviewSession
O sistema SHALL incluir testes unitários em `apps/web/app/hooks/__tests__/` para `useStreakScreen` e `useReviewSession`. Cobertura mínima: cenários de abertura/fechamento de modal, seleção de resposta, avanço de sessão e conclusão de sessão.

#### Scenario: useStreakScreen — abrir e fechar modal
- **WHEN** os testes executam `openGoalModal()` e `closeGoalModal()`
- **THEN** `showGoalModal` alterna entre `true` e `false` corretamente

#### Scenario: useReviewSession — fluxo completo de sessão
- **WHEN** o teste executa `startSession()`, `handleSelect(answer)`, `handleNext()` para cada item
- **THEN** `scores` contém o resultado correto e `sessionActive` volta para `false` ao concluir

---

### Requirement: Teste E2E — jornada progresso → streak → revisão → conclusão
O sistema SHALL incluir teste E2E Playwright em `apps/web/e2e/` cobrindo a jornada: login → ver progresso → ver streak → iniciar revisão → completar revisão.

#### Scenario: Jornada completa de progresso e revisão
- **WHEN** o usuário autenticado navega para `/progress`, depois para `/reviews` e completa uma sessão de revisão
- **THEN** todas as telas carregam sem erro, a sessão de revisão conclui com tela de resultado e o usuário retorna à lista de revisões

#### Scenario: Alterar meta diária
- **WHEN** o usuário clica em "Alterar" na tela de progresso, ajusta o slider e salva
- **THEN** o modal fecha e o valor da meta é atualizado na tela sem reload de página
