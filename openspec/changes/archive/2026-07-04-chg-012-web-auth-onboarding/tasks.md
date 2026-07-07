## 1. Fundação: Setup e Infraestrutura

- [x] 1.1 Adicionar `QueryClientProvider` ao `apps/web/app/providers.tsx` para habilitar TanStack Query em todo o app
- [x] 1.2 Criar diretório `apps/web/app/hooks/` para centralizar hooks de lógica das telas

## 2. Tela INT-01 — Splash Screen

- [x] 2.1 Criar componente `apps/web/app/SplashScreen.tsx` com animação do logo (fade-in + scale) e duração de ~1.5s
- [x] 2.2 Integrar `<SplashScreen>` ao `apps/web/app/layout.tsx` usando `useEffect` + `sessionStorage` para exibir apenas na primeira visita da sessão

## 3. Tela INT-02 — Boas-vindas (/)

- [x] 3.1 Adicionar redirect automático em `apps/web/app/page.tsx`: usuário autenticado + `onboardingCompleted=true` → `/dashboard`; autenticado + pendente → `/onboarding`

## 4. Telas INT-03 — Cadastro e Login

- [x] 4.1 Criar hook `apps/web/app/hooks/useLoginScreen.ts` com `useMutation` (TanStack Query) encapsulando `apiFetch` para `/auth/login` e lógica de redirect pós-login
- [x] 4.2 Refatorar `apps/web/app/login/page.tsx` para consumir `useLoginScreen` — remover lógica inline do componente
- [x] 4.3 Criar hook `apps/web/app/hooks/useRegisterScreen.ts` com `useMutation` para `/auth/register` e redirect para `/onboarding`
- [x] 4.4 Refatorar `apps/web/app/register/page.tsx` para consumir `useRegisterScreen` — remover lógica inline do componente
- [x] 4.5 Adicionar redirect automático em `/login` e `/register` para `/dashboard` quando usuário já está autenticado

## 5. Telas INT-04 a INT-07 — Onboarding Multi-Step

- [x] 5.1 Criar hook `apps/web/app/hooks/useOnboardingScreen.ts` com estado dos 4 passos, `useMutation` para `/users/me/onboarding` e lógica de redirect para `/assessment`
- [x] 5.2 Refatorar `apps/web/app/onboarding/page.tsx` para consumir `useOnboardingScreen` — remover lógica inline do componente
- [x] 5.3 Adicionar redirect automático em `/onboarding` para `/dashboard` quando `onboardingCompleted = true`

## 6. Telas INT-08 e INT-09 — Avaliação de Nível e Resultado

- [x] 6.1 Criar hook `apps/web/app/hooks/useAssessmentScreen.ts` com `useQuery` para buscar questões de `/assessment/questions` (com fallback estático), estado das respostas e `useMutation` para `/assessment/submit`
- [x] 6.2 Refatorar `apps/web/app/assessment/page.tsx` para consumir `useAssessmentScreen` — remover lógica inline do componente

## 7. Testes Unitários

- [x] 7.1 Criar `apps/web/app/hooks/__tests__/useLoginScreen.test.ts` cobrindo: submit válido → redirect; credenciais inválidas → exibe erro; loading state durante requisição
- [x] 7.2 Criar `apps/web/app/hooks/__tests__/useRegisterScreen.test.ts` cobrindo: cadastro válido → redirect; e-mail duplicado → erro; validação de senha fraca
- [x] 7.3 Criar `apps/web/app/hooks/__tests__/useOnboardingScreen.test.ts` cobrindo: progressão de passos; bloqueio sem seleção; submissão com sucesso; tratamento de erro

## 8. Teste E2E (Playwright)

- [x] 8.1 Criar `apps/web/e2e/onboarding-flow.spec.ts` cobrindo a jornada completa: abrir site → criar conta → completar onboarding (4 passos) → completar avaliação → ver resultado → acessar `/dashboard`
- [x] 8.2 Configurar mocks de rede no Playwright para `/auth/register`, `/users/me`, `/users/me/onboarding` e `/assessment/submit` para isolar do backend

## 9. Critério de Conclusão

- [x] 9.1 Executar `pnpm lint && pnpm typecheck && pnpm test && pnpm build --filter=web` sem erros
- [x] 9.2 Validar acessibilidade WCAG 2.1 AA nas telas INT-02, INT-03 (navegação por teclado, contraste, labels de formulário)
