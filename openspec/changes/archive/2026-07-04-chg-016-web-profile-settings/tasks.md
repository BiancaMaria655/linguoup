## 1. Hook useProfileScreen

- [x] 1.1 Criar `apps/web/app/hooks/useProfileScreen.ts` com tipos `UserProfile`, `XpData`, `Achievement` e lógica de queries (`["profile"]`, `["xp"]`, `["achievements"]`) + mutação `updateName` + `logout`
- [x] 1.2 Refatorar `apps/web/app/(client)/profile/page.tsx` para consumir apenas `useProfileScreen`, removendo lógica inline de queries e mutations
- [x] 1.3 Verificar: `pnpm lint && pnpm typecheck && pnpm build --filter=web`

## 2. Hook useSettingsScreen

- [x] 2.1 Criar `apps/web/app/hooks/useSettingsScreen.ts` com tipos `UserSettings`, estado de formulário local, query `["settings"]`, mutação `saveSettings` via `PATCH /users/me`, e `logout`
- [x] 2.2 Refatorar `apps/web/app/(client)/settings/page.tsx` para consumir apenas `useSettingsScreen`, removendo lógica inline
- [x] 2.3 Verificar: `pnpm lint && pnpm typecheck && pnpm build --filter=web`

## 3. Hook useNotificationsScreen + Badge no Layout

- [x] 3.1 Criar `apps/web/app/hooks/useNotificationsScreen.ts` com tipos `Notification`, query `["notifications"]`, `unreadCount`, mutações `markRead` e `markAllRead`
- [x] 3.2 Refatorar `apps/web/app/(client)/notifications/page.tsx` para consumir `useNotificationsScreen`
- [x] 3.3 Adicionar badge de `unreadCount` no `apps/web/app/(client)/layout.tsx` — usar `useQuery` com `queryKey: ["notifications"]` para obter a lista e derivar o count (mesma key, deduplicada pelo TanStack Query)
- [x] 3.4 Verificar: `pnpm lint && pnpm typecheck && pnpm build --filter=web`

## 4. Testes Unitários

- [x] 4.1 Criar `apps/web/app/hooks/__tests__/useSettingsScreen.test.ts` cobrindo: inicialização do formulário com dados da API, mutação de salvar com sucesso (verifica PATCH `/users/me`), e exposição de erro em caso de falha
- [x] 4.2 Criar `apps/web/app/hooks/__tests__/useNotificationsScreen.test.ts` cobrindo: `unreadCount` reflete `read: false`, `markRead` chama `PATCH /notifications/:id/read` e invalida cache, `markAllRead` chama `PATCH /notifications/read-all` e invalida cache
- [x] 4.3 Verificar: `pnpm test --filter=web` — todos os testes passam

## 5. Teste E2E

- [x] 5.1 Criar `apps/web/e2e/profile-edit-name.spec.ts` (Playwright) cobrindo a jornada: autenticar via mock/intercept → navegar para `/profile` → clicar em "Editar" → inserir novo nome → clicar em "Salvar" → verificar que o nome atualizado é exibido
- [x] 5.2 Verificar: `pnpm test:e2e --filter=web` — teste E2E passa

## 6. Critério Final de Conclusão

- [x] 6.1 Executar `pnpm lint && pnpm typecheck && pnpm test && pnpm build` na raiz do monorepo — todos os comandos passam sem erros
