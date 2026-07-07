## Context

O Web Client (`apps/web`) já possui layout responsivo (`(client)/layout.tsx`), pages de dashboard (`/dashboard`), catálogo de trilhas (`/lessons`) e trail detail (`/lessons/trail/[id]`). Essas implementações são funcionais mas usam lógica inline nos componentes de página (fetch direto com `useQuery` nos componentes, sem hook customizado dedicado), padrão diferente do adotado nas telas de auth/onboarding (`useLoginScreen`, `useRegisterScreen`, `useOnboardingScreen`, `useAssessmentScreen` em `app/hooks/`).

O endpoint `/users/me/home` é chamado diretamente no `DashboardPage`, e `/lessons/trails` é chamado em `LessonsPage`. Não existe hook `useHomeData` nem `useLessons` nem `useTrailDetail` — a query está inline.

Dependências já implementadas:
- CHG-011 (design system): tokens CSS e classes utilitárias disponíveis em `globals.css`.
- CHG-012 (auth/onboarding): `authStore` com `user` e `accessToken` disponíveis.
- API `/users/me/home`, `/lessons/trails`, `/lessons/trails/:id/lessons` existem no backend (CHG-006, CHG-007, CHG-008).

## Goals / Non-Goals

**Goals:**
- Extrair lógica de fetch das três pages para hooks customizados testáveis: `useHomeData`, `useLessons`, `useTrailDetail`.
- Adicionar teste unitário para `useHomeData` com MSW seguindo o mesmo padrão de `useLoginScreen.test.ts`.
- Adicionar teste E2E Playwright cobrindo a jornada: login → dashboard → trilhas → detalhe da trilha.
- Garantir que as páginas existentes continuem funcionando sem regressão (mudança é refactoring de responsabilidade, sem mudança de UI).

**Non-Goals:**
- Alterar o visual/layout das páginas (dashboard, lessons, trail detail já existem).
- Implementar `/reviews`, `/progress`, `/profile` completos (são placeholder).
- Alterar o backend ou contratos de API.
- Implementar execução de lição (CHG-014).

## Decisions

### D1 — Hooks em `app/hooks/` (padrão existente)
Todos os hooks de telas estão em `apps/web/app/hooks/`. Os novos hooks seguem o mesmo local e convenção.

**Alternativa considerada**: criar uma pasta `app/(client)/dashboard/hooks/` colocado próximo à feature. Descartado porque o padrão já estabelecido em CHG-012 coloca todos os hooks de screen em `app/hooks/` para permitir reuso e testabilidade centralizada.

### D2 — Hooks usam TanStack Query + authStore (padrão existente)
Os hooks expõem `data`, `isLoading`, `error` via `useQuery` do TanStack Query e lêem `accessToken` do `authStore`. Mesma assinatura que o padrão auth.

### D3 — Página permanece `"use client"` com hook como única dependência de lógica
O componente de página importa o hook e renderiza. Sem lógica de query, fetch, ou store diretamente no componente.

**Alternativa considerada**: mover para Server Components com `fetch` server-side. Descartado para o MVP porque requer refatoração de `authStore` (Zustand client-only) e não está no escopo desta mudança.

### D4 — Teste unitário de `useHomeData` com Vitest + MSW
Mesmo setup de `useLoginScreen.test.ts` — `renderHook` do Testing Library + MSW para mock de `apiFetch`. Sem dependência nova.

### D5 — Teste E2E Playwright na jornada principal
Seguindo o critério do proposal (CHG-013). Usa o setup Playwright existente do projeto.

## Risks / Trade-offs

- **[Risco] Regressão nas pages durante extração do hook** → Mitigação: a extração é mecânica (mover `useQuery` para dentro do hook e retornar os valores); os testes unitários e o `pnpm typecheck` detectam quebras imediatamente.
- **[Risco] API backend retorna 404/500 em ambiente local sem seed** → Mitigação: skeleton loading já implementado nas páginas; o E2E pode usar mock ou assumir dados seedados. Documentar pré-condição no teste.
- **[Trade-off] Hooks client-only impedem RSC futuro** → Aceitável para MVP; migração para RSC está planejada para V2 quando Zustand for substituído por solução server-compatible.

## Migration Plan

1. Criar `app/hooks/useHomeData.ts` extraindo a `useQuery` de `DashboardPage`.
2. Atualizar `DashboardPage` para usar `useHomeData()` em lugar da `useQuery` inline.
3. Criar `app/hooks/useLessons.ts` extraindo a `useQuery` de `LessonsPage`.
4. Atualizar `LessonsPage` para usar `useLessons(filter)`.
5. Criar `app/hooks/useTrailDetail.ts` extraindo a `useQuery` de `TrailDetailPage`.
6. Atualizar `TrailDetailPage` para usar `useTrailDetail(id)`.
7. Criar `app/hooks/__tests__/useHomeData.test.ts` com MSW.
8. Criar teste E2E Playwright em `e2e/dashboard.spec.ts` (ou caminho equivalente do projeto).
9. Executar `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.

Rollback: as mudanças são aditivas (novos arquivos) + substituição de import no componente. Reverter é um `git revert` simples.

## Open Questions

- O `TrailDetailPage` em `app/(client)/lessons/trail/[id]/` existe? (Diretório existe mas o arquivo de page não foi confirmado — verificar antes de implementar.)
- O projeto tem configuração Playwright (`playwright.config.ts`) e um diretório `e2e/`? Verificar caminho correto antes de criar o spec E2E.
