## 1. Hook de Sessão de Lição

- [x] 1.1 Criar `apps/web/app/hooks/useLessonExecution.ts` — mover interfaces `Exercise`, `LessonDetail`, `SessionState` do `page.tsx` para o hook
- [x] 1.2 Implementar `handleAnswer` no hook: validação case-insensitive + trimmed, atualização de `session.answers` e `session.feedbacks`
- [x] 1.3 Implementar `handleNext` no hook: incremento de `session.current`, reset de `showFeedback`/`selectedOption`/`fillInput`, e chamada de `onComplete(correctPct, timeSpentSeconds)` ao finalizar
- [x] 1.4 Implementar timer via `useEffect + setInterval` incrementando `elapsedSeconds` a cada segundo; limpar intervalo em cleanup
- [x] 1.5 Exportar todas as interfaces do hook para uso no `page.tsx`
- [x] 1.6 Verificar: `pnpm typecheck --filter=web`

## 2. Refatoração da Página de Execução (INT-13)

- [x] 2.1 Substituir estado inline do `page.tsx` pelo `useLessonExecution` hook; remover `useState` de sessão duplicados
- [x] 2.2 Adicionar timer visual (MM:SS) na barra superior ao lado do contador de questões
- [x] 2.3 Validar que todos os três tipos de exercício (`multiple_choice`, `fill_blank`, `translation`) continuam funcionando corretamente após refatoração
- [x] 2.4 Verificar: `pnpm lint --filter=web && pnpm typecheck --filter=web`

## 3. Tela de Resultado Enriquecida (INT-14)

- [x] 3.1 Adicionar `queryClient.invalidateQueries({ queryKey: ["achievements"] })` e `queryClient.invalidateQueries({ queryKey: ["xp"] })` no `onSuccess` da `completeMutation`
- [x] 3.2 Adicionar `useQuery` para `GET /api/v1/achievements` na tela de resultado (habilitado apenas quando `isDone === true`)
- [x] 3.3 Implementar animação CSS de contagem XP (0 → valor em ~1s) usando `@keyframes` no `globals.css` ou via `style` inline com CSS custom property
- [x] 3.4 Exibir conquistas desbloqueadas na tela de resultado: lista com nome + ícone; skeleton durante loading de achievements
- [x] 3.5 Verificar que emojis motivacionais (🎉/👏/💪) são exibidos corretamente conforme threshold de pontuação
- [x] 3.6 Verificar: `pnpm lint --filter=web && pnpm typecheck --filter=web`

## 4. Testes Unitários do Hook

- [x] 4.1 Criar `apps/web/app/hooks/__tests__/useLessonExecution.test.ts`
- [x] 4.2 Testar `handleAnswer` com resposta correta: `feedbacks[0] === true`, `showFeedback === true`
- [x] 4.3 Testar `handleAnswer` com resposta incorreta: `feedbacks[0] === false`, `showFeedback === true`
- [x] 4.4 Testar `handleNext` com questões restantes: `current` incrementa, `showFeedback` reseta para `false`
- [x] 4.5 Testar `handleNext` na última questão: callback `onComplete` é chamado com `(correctPct, timeSpentSeconds)`
- [x] 4.6 Testar que `handleAnswer` não executa quando `showFeedback === true` (proteção contra duplo clique)
- [x] 4.7 Verificar: `pnpm test --filter=web`

## 5. Testes E2E da Jornada Completa

- [x] 5.1 Criar `apps/web/e2e/lesson-execution.spec.ts` (ou pasta equivalente do projeto)
- [x] 5.2 Mockar `GET /api/v1/lessons/:id` via `page.route()` com fixture de lição com 3 exercícios (1 de cada tipo)
- [x] 5.3 Mockar `POST /api/v1/lessons/:id/complete` retornando `{ data: { xpAwarded: 40, newAchievements: [], currentStreak: 3 } }`
- [x] 5.4 Mockar `GET /api/v1/achievements` retornando array vazio inicial
- [x] 5.5 Testar jornada completa: navegar para `/lessons/[id]` → responder todas as questões → clicar "Ver resultado →" → verificar exibição de XP e botões de navegação
- [x] 5.6 Testar navegação "Voltar para Home": clicar botão → verificar URL `/dashboard`
- [x] 5.7 Verificar: `pnpm exec playwright test apps/web/e2e/lesson-execution.spec.ts --project=chromium` → 2 passed

## 6. Critério de Conclusão

- [x] 6.1 Executar `pnpm lint && pnpm typecheck && pnpm test && pnpm build` sem erros
- [ ] 6.2 Verificação manual: abrir lição via `/lessons/[id]` → responder questões → confirmar timer, feedback e tela de resultado com XP e conquistas
- [ ] 6.3 Verificar que o XP e streak são atualizados no dashboard após completar lição (cache invalidado)
