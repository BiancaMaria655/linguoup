## Context

O CHG-012 cobre as telas INT-01 a INT-09 do portal do aluno: Splash Screen, Boas-vindas, Cadastro/Login, Objetivo de Aprendizado, Idioma Desejado, Disponibilidade Diária, Plano Inicial, Avaliação de Nível e Resultado da Avaliação.

**Estado atual:** As rotas `/login`, `/register`, `/onboarding` e `/assessment` já existem como páginas monolíticas `"use client"` com lógica, UI e chamadas de API mescladas no mesmo arquivo. Funciona em desenvolvimento mas viola as diretrizes de arquitetura (separação UI/lógica) e não possui testes unitários nem E2E. A rota raiz (`/`) serve como Boas-vindas estático. Não há Splash Screen (INT-01) nem rota de welcome dedicada (INT-02).

**Dependências satisfeitas:**
- CHG-004 (api-auth): endpoint `/api/v1/auth/login` e `/api/v1/auth/register` disponíveis.
- CHG-005 (save-onboarding): endpoint `/api/v1/users/me/onboarding` disponível.
- CHG-006 (api-assessment): endpoint `/api/v1/assessment/submit` disponível.
- CHG-011 (design-system): tokens CSS (CSS custom properties), classes utilitárias (`btn-primary`, `btn-secondary`, `glass`, `feedback-correct/incorrect`, `animate-fade-in-up`, `animate-float`, `gradient-text`, `input-field`) definidos em `globals.css`.

**Protótipos Stitch disponíveis** (projeto `13167686388520823014`):
- `366558076ad74978ab390dbfcebe3d1d` — Cadastro e Login
- `4c944ac3184740a7b161656e5f825a4e` — Objetivos e Idioma
- `d2fec5bb7ae84108ac794d7209063f6c` — Disponibilidade e Plano Inicial
- `ef5b80bf8f51483d97812fd66698728e` — Boas-vindas
- `88d4dcb398c248efa8ce3cb8ccfc1e9d` — Login Desktop (referência)

## Goals / Non-Goals

**Goals:**
- Separar UI de lógica em todas as 9 telas: componente puro + hook dedicado por tela.
- Criar hooks TanStack Query (`useRegister`, `useLogin`, `useOnboarding`, `useAssessment`) para chamadas de API.
- Adicionar rota `/welcome` (INT-02) separada da raiz, que redireciona usuários logados para `/dashboard`.
- Adicionar animação de Splash Screen (INT-01) no carregamento inicial do app via layout.
- Garantir fluxo de navegação máximo em 3 toques: `/` → `/register` → `/onboarding` → iniciar aprendizado.
- Adicionar testes unitários para hooks (`useLoginScreen`, `useOnboardingScreen`).
- Adicionar teste E2E Playwright cobrindo a jornada completa: abertura → cadastro → onboarding → avaliação → resultado.
- Validar WCAG 2.1 AA nas telas de autenticação.

**Non-Goals:**
- Login social Google/Apple.
- Recuperação de senha (esqueci minha senha).
- Telas pós-login: dashboard, lições, gamificação (CHG-013, CHG-014).
- Mudanças no backend/API.
- Modificações no schema Prisma.

## Decisions

### D1: Manter rotas existentes, refatorar internamente

**Decisão:** Refatorar as páginas existentes (`/login`, `/register`, `/onboarding`, `/assessment`) sem alterar as rotas. Não criar novos grupos de rota (`(auth)`).

**Rationale:** As rotas já existem e funcionam. Criar grupos de rota quebraria URLs existentes e aumentaria a complexidade sem benefício claro no MVP. O isolamento de lógica será feito pelo padrão hook + componente, não por estrutura de pastas.

**Alternativa considerada:** Criar grupo `(auth)` com layouts isolados → descartado por ser refatoração estrutural não solicitada que aumentaria risco de quebra.

### D2: Hooks customizados com TanStack Query para chamadas de API

**Decisão:** Criar hooks em `apps/web/app/hooks/` usando `useMutation` do TanStack Query para login, register e onboarding. Manter `useAuthStore` (Zustand) para persistência de token e estado do usuário.

**Rationale:** Segue a tabela de decisão de estado do AGENTS.md (cache/dados remotos → TanStack Query; estado global de UI → Zustand). Simplifica retry, loading e error states. Os hooks existentes chamam `apiFetch` diretamente nas páginas — essa lógica deve migrar para hooks reutilizáveis.

**Alternativa considerada:** Deixar chamadas diretas a `apiFetch` dentro de `useState/useEffect` — descartado pois viola separação de concerns e impede testes unitários.

### D3: Splash Screen como animação no layout raiz, não como rota separada

**Decisão:** Implementar INT-01 como estado de carregamento inicial no `app/layout.tsx` usando um componente `<SplashScreen>` que aparece por ~1.5s na primeira visita e é suprimido via `sessionStorage`.

**Rationale:** A spec pede animação de logo/loader — é um efeito de UX, não uma rota navegável. Usar `sessionStorage` evita que apareça em reloads dentro da mesma sessão.

**Alternativa considerada:** Rota `/splash` com redirect → descartado pois complica SEO e adiciona hop de navegação desnecessário.

### D4: Rota `/` mantida como Welcome (INT-02), sem rota `/welcome` separada

**Decisão:** A rota raiz `/` (`app/page.tsx`) já serve como tela de Boas-vindas. Adicionar redirect automático para `/dashboard` quando o usuário está autenticado e com onboarding completo.

**Rationale:** Adicionar `/welcome` duplicaria a rota raiz. A rota raiz já corresponde ao protótipo `ef5b80bf...` de Boas-vindas. O redirect condicional é o comportamento esperado.

### D5: Questionário de avaliação com perguntas da API (fallback local)

**Decisão:** A tela de avaliação (INT-08) tentará buscar perguntas de `/api/v1/assessment/questions` com `useQuery`. Em caso de erro ou ausência, usará as perguntas estáticas locais como fallback.

**Rationale:** O código atual usa `SAMPLE_QUESTIONS` hardcoded. A API de assessment já existe (CHG-006). Adicionar a busca dinâmica com fallback gracioso não quebra o fluxo existente e prepara a tela para dados reais.

## Risks / Trade-offs

| Risco | Mitigação |
|-------|-----------|
| Refatoração de páginas existentes pode quebrar comportamento atual | Manter contrato de props e fluxo de navegação idênticos; cobertura E2E antes e depois |
| TanStack Query ainda não está configurado no `providers.tsx` (apenas Zustand) | Adicionar `QueryClientProvider` em `app/providers.tsx` como primeira tarefa |
| Splash Screen com `sessionStorage` pode não aparecer em SSR/hydration | Usar `useEffect` para ler `sessionStorage` somente no cliente; `suppressHydrationWarning` se necessário |
| Perguntas de avaliação da API podem não estar implementadas no backend | Fallback para `SAMPLE_QUESTIONS` garantido; endpoint é opcional |
| Testes E2E exigem backend rodando | Usar `msw` ou mocks de rede no Playwright para isolar de infra |
