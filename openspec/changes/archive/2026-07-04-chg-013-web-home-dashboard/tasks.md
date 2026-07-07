## 1. Hook useHomeData

- [x] 1.1 Criar `apps/web/app/hooks/useHomeData.ts` extraindo a `useQuery` de `DashboardPage` (interface `HomeData`, queryKey `["home"]`, endpoint `/users/me/home`)
- [x] 1.2 Atualizar `apps/web/app/(client)/dashboard/page.tsx` para importar e usar `useHomeData()` removendo o `useQuery` inline
- [x] 1.3 Executar `pnpm typecheck --filter=web` e garantir zero erros de tipo

## 2. Hook useLessons

- [x] 2.1 Criar `apps/web/app/hooks/useLessons.ts` extraindo a `useQuery` de `LessonsPage` (interface `Trail`, queryKey `["trails", filter]`, endpoint `/lessons/trails`)
- [x] 2.2 Atualizar `apps/web/app/(client)/lessons/page.tsx` para importar e usar `useLessons(filter)` removendo o `useQuery` inline
- [x] 2.3 Executar `pnpm typecheck --filter=web` e garantir zero erros de tipo

## 3. Hook useTrailDetail

- [x] 3.1 Verificar estrutura atual de `apps/web/app/(client)/lessons/trail/[id]/page.tsx` e identificar a `useQuery` inline existente
- [x] 3.2 Criar `apps/web/app/hooks/useTrailDetail.ts` extraindo a `useQuery` com a interface de lições da trilha, queryKey `["trail", id]`, endpoint `/lessons/trails/:id/lessons`
- [x] 3.3 Atualizar a `TrailDetailPage` para usar `useTrailDetail(id)` removendo o `useQuery` inline
- [x] 3.4 Executar `pnpm typecheck --filter=web` e garantir zero erros de tipo

## 4. Teste Unitário useHomeData

- [x] 4.1 Criar `apps/web/app/hooks/__tests__/useHomeData.test.ts` com MSW seguindo o padrão de `useLoginScreen.test.ts`
- [x] 4.2 Cobrir cenário: sucesso — API retorna dados → `data` com streak, xp, level, nextLesson, pendingReviews
- [x] 4.3 Cobrir cenário: loading inicial — `isLoading: true` antes da resposta
- [x] 4.4 Cobrir cenário: erro da API — MSW retorna 500 → `isError: true`
- [x] 4.5 Executar `pnpm test --filter=web` e confirmar que todos os testes passam

## 5. Teste E2E Playwright — Jornada Área Autenticada

- [x] 5.1 Verificar localização do diretório `e2e/` e arquivo `playwright.config.ts` no projeto
- [x] 5.2 Criar `e2e/dashboard.spec.ts` (ou equivalente) com setup de autenticação (cookie/token via `storageState` ou fixture)
- [x] 5.3 Implementar cenário: autenticar → acessar `/dashboard` → verificar elementos (saudação, streak card, XP card)
- [x] 5.4 Implementar cenário: navegar para `/lessons` → verificar lista de trilhas renderizada
- [x] 5.5 Implementar cenário: clicar em trilha → verificar que navega para `/lessons/trail/[id]` e exibe cabeçalho da trilha
- [x] 5.6 Executar `pnpm test:e2e --filter=web` e confirmar que o spec passa

## 6. Verificação Final

- [x] 6.1 Executar `pnpm lint --filter=web` e corrigir quaisquer erros
- [x] 6.2 Executar `pnpm typecheck --filter=web`
- [x] 6.3 Executar `pnpm test --filter=web`
- [x] 6.4 Executar `pnpm build --filter=web`
