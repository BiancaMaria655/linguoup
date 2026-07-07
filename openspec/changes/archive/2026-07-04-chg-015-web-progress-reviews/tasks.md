## 1. Hook useStreakScreen

- [x] 1.1 Criar `apps/web/app/hooks/useStreakScreen.ts` com tipos `StreakData`, estado de `showGoalModal`, `newGoal`, e mutation `updateGoal` consumindo `POST /users/me/onboarding`
- [x] 1.2 Expor funções `openGoalModal()`, `closeGoalModal()` e `updateGoal(minutes)` com invalidação das queries `["progress"]` e `["home"]` no `onSuccess`
- [x] 1.3 Verificar: `pnpm typecheck --filter=web` passa sem erros no novo hook

## 2. Hook useReviewSession

- [x] 2.1 Criar `apps/web/app/hooks/useReviewSession.ts` com interface `ReviewItem`, estado de sessão (`sessionIndex`, `sessionActive`, `selected`, `showFeedback`, `scores`) e mutation `completeMutation` consumindo `POST /reviews/:id/complete`
- [x] 2.2 Implementar `startSession()`, `handleSelect(answer)` com guard de duplo-clique, `handleNext()` com lógica de conclusão e invalidação de `["reviews"]` e `["home"]`
- [x] 2.3 Verificar: `pnpm typecheck --filter=web` passa sem erros no novo hook

## 3. Refatorar progress/page.tsx

- [x] 3.1 Substituir lógica inline de streak/meta por chamada ao `useStreakScreen`, mantendo o mesmo JSX de modal e cards
- [x] 3.2 Remover o bloco de conquistas (`achievements` query e grid) da página `/progress` (será movido para `/profile`)
- [x] 3.3 Verificar que a página `/progress` renderiza corretamente com filtro de período, gráfico de atividade, cards de streak e calendário

## 4. Refatorar reviews/page.tsx

- [x] 4.1 Substituir lógica inline da sessão de revisão por chamada ao `useReviewSession`, passando `data?.items ?? []`
- [x] 4.2 Verificar que a página `/reviews` renderiza lista, inicia sessão, avança itens e exibe tela de resultado corretamente

## 5. Página /profile (INT-16)

- [x] 5.1 Criar `apps/web/app/(client)/profile/page.tsx` com query `GET /xp` exibindo nível, XP total e barra de progresso para próximo nível
- [x] 5.2 Adicionar query `GET /achievements/me` com grid de conquistas: desbloqueadas em cor, bloqueadas com opacidade reduzida e tooltip do critério
- [x] 5.3 Adicionar skeleton loaders para os estados de loading de XP e conquistas
- [x] 5.4 Verificar que a rota `/profile` está acessível via bottom navigation e renderiza corretamente

## 6. Testes unitários

- [x] 6.1 Criar `apps/web/app/hooks/__tests__/useStreakScreen.test.ts` cobrindo: `openGoalModal`, `closeGoalModal`, `updateGoal` (mock da mutation), estado inicial
- [x] 6.2 Criar `apps/web/app/hooks/__tests__/useReviewSession.test.ts` cobrindo: `startSession`, `handleSelect` (correto e incorreto), `handleNext` (avanço e conclusão), guard de duplo-clique
- [x] 6.3 Verificar: `pnpm test --filter=web` passa com os novos testes

## 7. Teste E2E

- [x] 7.1 Criar `apps/web/e2e/progress-reviews.spec.ts` com Playwright cobrindo a jornada: login → `/progress` (verificar stats carregados) → `/reviews` (verificar lista) → iniciar sessão → responder todos os itens → ver tela de resultado
- [x] 7.2 Adicionar cenário: abrir modal de meta diária, ajustar slider, salvar e verificar que o valor atualiza na tela sem reload
- [x] 7.3 Verificar: `pnpm test:e2e --filter=web` passa para os novos cenários

## 8. Validação final

- [x] 8.1 Executar `pnpm lint && pnpm typecheck && pnpm test && pnpm build` e garantir que tudo passa sem erros
- [x] 8.2 Verificar manualmente no browser: `/progress` (filtros, gráfico, modal meta), `/reviews` (lista, sessão, resultado), `/profile` (XP, conquistas)
