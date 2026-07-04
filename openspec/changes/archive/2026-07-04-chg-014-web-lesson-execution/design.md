## Context

A rota `/lessons/[id]` (INT-13) já existe com implementação inicial em `apps/web/app/(client)/lessons/[id]/page.tsx`. A página:

- Faz `GET /api/v1/lessons/{id}` via TanStack Query para carregar exercícios.
- Gerencia estado de sessão local via `useState` (questão atual, respostas, feedbacks, timer).
- Suporta três tipos de exercício: múltipla escolha, completar frase, tradução.
- Chama `POST /api/v1/lessons/{id}/complete` com `score` e `timeSpentSeconds` ao finalizar.
- Exibe tela de resultado inline (mesmo arquivo) com XP estimado, pontuação e botões de navegação.

A tela de resultado (INT-14) está embutida no mesmo componente — quando `current >= total`, renderiza o resultado em vez do exercício. **Não existe rota separada `/lessons/[id]/result`** ainda.

O que está **faltando** em relação à proposta:
1. Hook `useLessonExecution` extraído (lógica de sessão ainda inline no `page.tsx`).
2. Tela de resultado **sem** animação de contagem de XP, sem conquistas, sem streak atualizado.
3. Sem invalidação de cache de `achievements` após completar lição.
4. Timer visual não exibido na barra superior.
5. Testes unitários do hook de sessão ausentes.
6. Testes E2E da jornada completa ausentes.

---

## Goals / Non-Goals

**Goals:**
- Extrair `useLessonExecution` hook com lógica de sessão testável (score, navegação, timer).
- Enriquecer tela de resultado (INT-14) com: animação XP counter, conquistas desbloqueadas via `GET /api/v1/achievements` + invalidação pós-complete, streak atualizado.
- Adicionar timer visual na barra superior (minutos decorridos ou contagem regressiva).
- Invalidar cache de `achievements` e `xp` após `completeMutation.onSuccess`.
- Cobertura de testes: unitários do hook + E2E da jornada completa com Playwright.

**Non-Goals:**
- Tipos de exercício avançados (áudio, escrita livre) — V2.
- Modo offline — V2.
- Rota separada `/lessons/[id]/result` — a tela inline é suficiente para MVP.
- Retomada de lição após fechar página — V2.

---

## Decisions

### 1. Manter rota inline vs. rota separada para resultado
**Decisão:** Manter resultado inline no mesmo arquivo, sem criar `/lessons/[id]/result`.
**Racional:** A proposta listou a rota `/lessons/[id]/result` como possibilidade, mas a implementação atual já funciona inline e simplifica o compartilhamento de estado de sessão (score, feedbacks, startTime). Criar rota separada exigiria persistência de estado entre rotas (sessionStorage ou Zustand), adicionando complexidade sem benefício no MVP.
**Alternativa descartada:** Rota separada com `sessionStorage` — descartada por especulativa.

### 2. Extração do hook `useLessonExecution`
**Decisão:** Extrair toda a lógica de sessão (estado, handleAnswer, handleNext, cálculo de score) para `apps/web/app/hooks/useLessonExecution.ts`.
**Racional:** O `page.tsx` atual tem 325 linhas com lógica e UI misturadas. A extração segue o padrão já estabelecido no projeto (`useAssessmentScreen`, `useHomeData`, etc.) e habilita testes unitários isolados.
**Alternativa descartada:** Testar a page diretamente com RTL — mais difícil de isolar, contrário ao padrão do projeto.

### 3. Dados de conquistas após completar lição
**Decisão:** Usar `queryClient.invalidateQueries({ queryKey: ["achievements"] })` no `onSuccess` da `completeMutation` existente + ler conquistas via `useQuery` na tela de resultado.
**Racional:** Não existe endpoint específico `newAchievements` confirmado no spec_tech. A abordagem de invalidação + re-fetch é consistente com o padrão já utilizado para `home` e `progress`. O backend (CHG-008) retorna conquistas no response do `/complete` ou via `/achievements` — a invalidação garante dados frescos sem acoplamento.
**Alternativa descartada:** Ler `newAchievements` do response do `/complete` — depende de contrato não confirmado no spec_tech atual.

### 4. Timer visual
**Decisão:** Exibir tempo decorrido (MM:SS) atualizado a cada segundo via `useEffect + setInterval`, baseado em `startTime` já presente no estado da sessão.
**Racional:** A proposta pede "timer visual (3–5 min target)". Tempo decorrido é mais simples que contagem regressiva e não requer configuração de duração máxima por lição.

### 5. Animação XP counter
**Decisão:** Implementar via CSS counter animation simples (de 0 até valor final em ~1s) sem biblioteca externa.
**Racional:** Evita nova dependência. O padrão do projeto não usa biblioteca de animação JS.

---

## Risks / Trade-offs

| Risco | Mitigação |
|-------|-----------|
| API `/lessons/{id}` pode retornar exercícios sem campo `exercises` (MVP/backend não finalizado) | Fallback já existe com array vazio; manter guard `lesson.exercises?.length` |
| Cache de achievements pode demorar para atualizar (re-fetch após invalidação) | Usar `isFetching` state para mostrar skeleton nas conquistas da tela de resultado |
| E2E com Playwright depende de API rodando | Usar `page.route()` para mockar endpoints de lição e complete nas suítes E2E |
| Extração do hook pode quebrar referências de tipo | Colocar interfaces (`Exercise`, `LessonDetail`, `SessionState`) no mesmo arquivo do hook e importar na page |

---

## Migration Plan

1. Criar `useLessonExecution.ts` com lógica extraída de `page.tsx`.
2. Refatorar `page.tsx` para usar o hook (substituição interna, sem mudança de rota ou API).
3. Adicionar `queryClient.invalidateQueries({ queryKey: ["achievements"] })` no `onSuccess`.
4. Adicionar timer visual na barra superior da página de execução.
5. Enriquecer tela de resultado com animação XP, conquistas e streak.
6. Criar testes unitários `useLessonExecution.test.ts`.
7. Criar testes E2E `lesson-execution.spec.ts` com mocks de API.
8. Executar critério de conclusão: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.

Rollback: sem migrations de banco ou alterações de API — rollback via `git revert` é seguro.

---

## Open Questions

- O endpoint `POST /api/v1/lessons/{id}/complete` retorna conquistas desbloqueadas no response? Se sim, podemos ler diretamente sem re-fetch de `/achievements`.
- Existe endpoint `GET /api/v1/xp` que retorna XP total atual para exibir na tela de resultado? (está no spec_tech mas não validado).
