## Context

**Produto:** LinguoUp — portal do aluno (Next.js App Router).

**Estado atual:** As rotas `/progress` e `/reviews` já existem como páginas monolíticas com toda a lógica embutida inline. A página `progress/page.tsx` (270 linhas) combina streak, meta diária, gráfico de atividade, calendário e conquistas numa única tela. A página `reviews/page.tsx` (235 linhas) gerencia lista de pendências e a sessão de revisão no mesmo componente. Ambas consomem a API diretamente via `useQuery`/`useMutation` sem hooks dedicados.

**Dependências já implementadas:**
- CHG-007: endpoints `/progress`, `/streak` — disponíveis e funcionando.
- CHG-008: endpoints `/xp`, `/achievements/me` — disponíveis.
- CHG-009: endpoints `/reviews/pending`, `/reviews/:id/complete`, `/reviews/:id/postpone` — disponíveis.
- CHG-011: design system com tokens CSS (`--brand-*`, `--surface-*`, `glass`, `btn-primary`, `skeleton`) — em uso nas páginas atuais.
- CHG-013: layout do portal do aluno com bottom navigation — rotas `/progress` e `/reviews` já registradas.
- CHG-014: `useLessonExecution` hook como referência de padrão de hook de sessão.

**Problema:** As telas existentes são scaffolds funcionais mas incompletos. Faltam:
1. **Hook `useStreakScreen`** — lógica de streak/meta extraída do page.tsx (sem hook próprio hoje).
2. **Hook `useReviewSession`** — lógica da sessão de revisão embutida inline no page.tsx.
3. **Rota `/profile`** — conquistas e XP estão na página `progress/page.tsx` em vez de ter rota própria.
4. **Testes unitários** — nenhum teste para os hooks de progresso/revisão.
5. **Testes E2E** — jornada progresso → streak → revisão → conclusão.

---

## Goals / Non-Goals

**Goals:**
- Extrair `useStreakScreen` e `useReviewSession` como hooks dedicados seguindo o padrão de `useLessonExecution`.
- Refinar visualmente as páginas `/progress` e `/reviews` para alinhar com os protótipos Stitch (INT-15 a INT-18), sem alterar contratos de API.
- Criar (ou completar) a rota `/profile` com nível XP + conquistas (INT-16), separando do bloco `progress/page.tsx`.
- Adicionar testes unitários para `useStreakScreen` e `useReviewSession`.
- Adicionar teste E2E (Playwright) para a jornada principal.

**Non-Goals:**
- Alterar qualquer endpoint da API (`/progress`, `/reviews`, `/achievements`).
- Criar novo schema Prisma ou migration.
- Implementar rankings entre usuários (V3).
- Exportação de dados de progresso (V4).
- Gráficos de retenção de vocabulário (V2).

---

## Decisions

### 1. Extrair lógica para hooks dedicados (vs. manter inline)

**Decisão:** Criar `useStreakScreen` e `useReviewSession` em `apps/web/app/hooks/`.

**Rationale:** O padrão já foi estabelecido em CHG-014 com `useLessonExecution`. Hooks dedicados permitem testar a lógica isoladamente, reduzem o tamanho dos componentes de página e facilitam reutilização (ex.: streak widget no dashboard).

**Alternativa considerada:** Manter lógica inline no page.tsx. Rejeitado porque impossibilita testes unitários e duplica código se o widget de streak aparecer em outras telas.

---

### 2. Rota `/profile` separada para conquistas e XP (vs. manter em `/progress`)

**Decisão:** Criar `apps/web/app/(client)/profile/page.tsx` (INT-16) e remover o bloco de conquistas de `progress/page.tsx`.

**Rationale:** O protótipo Stitch (screen `8463ee2535f4421d9a97c1ffa3061744`) define "Perfil e Conquistas" como tela distinta. A bottom navigation já tem tab de Perfil apontando para `/profile`. Misturar streak + progresso + conquistas numa única página prejudica a clareza.

**Alternativa considerada:** Manter conquistas em `/progress` e duplicar em `/profile`. Rejeitado — duplicação de estado e queries.

---

### 3. Gráfico de atividade via SVG puro (vs. biblioteca de charts)

**Decisão:** Manter SVG puro (`<rect>` e posicionamento manual) para o gráfico de barras de atividade diária.

**Rationale:** O gráfico atual em `progress/page.tsx` já funciona com `<div>` flexbox. Migrar para SVG apenas padroniza o código sem adicionar dependência. Recharts ou Chart.js são desnecessários para a complexidade atual (barras simples com tooltip de hover).

**Alternativa considerada:** Adicionar Recharts. Rejeitado — dependência nova sem aprovação, funcionalidade não justifica.

---

### 4. Sessão de revisão reutiliza padrão de `useLessonExecution` (vs. lógica diferente)

**Decisão:** `useReviewSession` terá interface semelhante a `useLessonExecution` — gerencia índice atual, seleção, feedback, scores e callback `onComplete`.

**Rationale:** A sessão de revisão e a sessão de lição têm o mesmo fluxo de UX. Usar o mesmo padrão reduz a curva de manutenção.

**Diferença:** `useReviewSession` recebe `ReviewItem[]` (não `Exercise[]`) e dispara `completeMutation` internamente para chamar `/reviews/:id/complete`.

---

## Risks / Trade-offs

| Risco | Mitigação |
|---|---|
| `progress/page.tsx` já tem conquistas — remover pode quebrar a UX se `/profile` não estiver pronto simultaneamente | Implementar `/profile` completo antes de remover o bloco de conquistas de `/progress` |
| Protótipos Stitch (mobile 390px) diferem do layout desktop atual | Seguir os tokens do design system; adaptar layout responsivo sem forçar viewport fixo |
| Hooks extraídos podem ter comportamento diferente do inline atual | Testes unitários antes e depois da extração como safety net |
| Mock de `useMutation` nos testes pode não cobrir todos os estados de erro | Cobrir pelo menos: `isPending`, `isError`, `onSuccess` em cada mutation |

---

## Migration Plan

1. Criar hooks `useStreakScreen` e `useReviewSession` em `apps/web/app/hooks/`.
2. Criar/completar `apps/web/app/(client)/profile/page.tsx` com conquistas e XP.
3. Refatorar `progress/page.tsx` para usar `useStreakScreen` e remover bloco de conquistas (delegando para `/profile`).
4. Refatorar `reviews/page.tsx` para usar `useReviewSession`.
5. Adicionar testes unitários para os dois novos hooks.
6. Adicionar teste E2E em `apps/web/e2e/` para a jornada principal.
7. Executar `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.

**Rollback:** Todas as alterações são aditivas (novos arquivos de hook + testes). O rollback de `progress/page.tsx` e `reviews/page.tsx` é feito via `git revert` sem impacto na API.

---

## Open Questions

- O tab "Perfil" na bottom navigation já aponta para `/profile` ou ainda para outra rota? (verificar `layout.tsx` do client group antes de implementar)
- O endpoint `/achievements/me` retorna array paginado ou array completo? (impacta se é necessário paginação na tela de conquistas)
