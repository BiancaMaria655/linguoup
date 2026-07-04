## ADDED Requirements

### Requirement: Lesson Result Screen
O sistema SHALL exibir a tela de resultado ao final de uma microlição (`session.current >= total`), mostrando: emoji motivacional baseado em pontuação, XP ganho com animação de contagem (0 → valor), número de acertos/erros, conquistas desbloqueadas e streak atual. A tela SHALL completar a lição via `POST /api/v1/lessons/{id}/complete` ao transitar para o estado de resultado.

**Rota**: Inline em `/lessons/[id]` (condicional `isDone === true`)
**RBAC**: `USER`
**Endpoints consumidos**:
- `POST /api/v1/lessons/{id}/complete` — chamado automaticamente ao finalizar última questão
- `GET /api/v1/achievements` — re-fetched após invalidação de cache

**Request (complete)**:
```json
{ "score": 80, "timeSpentSeconds": 245 }
```
**Response (complete, 200)**:
```json
{
  "data": {
    "xpAwarded": 40,
    "newAchievements": [],
    "currentStreak": 3
  }
}
```

**Cache invalidado em `onSuccess`**: `["home"]`, `["progress"]`, `["achievements"]`, `["xp"]`

#### Scenario: Display result screen after last question
- **WHEN** usuário clica "Ver resultado →" na última questão
- **THEN** `completeMutation` é disparado com `{ score: correctPct, timeSpentSeconds }` e tela de resultado é exibida

#### Scenario: XP counter animation
- **WHEN** tela de resultado é montada
- **THEN** contador de XP anima de 0 até `xpAwarded` (ou estimativa `Math.max(10, score * 5)`) em aproximadamente 1 segundo via CSS animation

#### Scenario: High score motivational emoji
- **WHEN** `correctPct >= 80`
- **THEN** emoji "🎉" é exibido no topo da tela de resultado

#### Scenario: Medium score motivational emoji
- **WHEN** `correctPct >= 50 && correctPct < 80`
- **THEN** emoji "👏" é exibido

#### Scenario: Low score motivational emoji
- **WHEN** `correctPct < 50`
- **THEN** emoji "💪" é exibido

#### Scenario: Display score and time
- **WHEN** tela de resultado é exibida
- **THEN** painel glass exibe: pontuação percentual, tempo total em minutos, XP ganho com cor `var(--brand-400)`

#### Scenario: Display new achievements
- **WHEN** `completeMutation.onSuccess` invalida cache de achievements e re-fetch retorna conquistas novas
- **THEN** conquistas são exibidas na tela de resultado (nome + ícone)

#### Scenario: Navigate to next lesson
- **WHEN** usuário clica "Próxima Lição →"
- **THEN** router navega para `/lessons`

#### Scenario: Navigate to review content
- **WHEN** usuário clica "Revisar Conteúdo"
- **THEN** router navega para `/reviews`

#### Scenario: Navigate back to home
- **WHEN** usuário clica "Voltar para Home"
- **THEN** router navega para `/dashboard`

#### Scenario: Complete mutation failure
- **WHEN** `POST /api/v1/lessons/{id}/complete` retorna erro (4xx/5xx)
- **THEN** tela de resultado ainda é exibida com pontuação local; erro é logado via Sentry sem bloquear UI

---

### Requirement: Complete Lesson API Integration
O sistema SHALL integrar o frontend com `POST /api/v1/lessons/{id}/complete` de forma que a mutação invalide os caches de `home`, `progress`, `achievements` e `xp` no `onSuccess`, garantindo dados frescos nas próximas telas.

**Endpoint**: `POST /api/v1/lessons/{id}/complete`
**RBAC**: `USER`
**tenant_id**: validado implicitamente via JWT no backend

#### Scenario: Cache invalidation on success
- **WHEN** `completeMutation.onSuccess` é disparado
- **THEN** `queryClient.invalidateQueries` é chamado para as query keys: `["home"]`, `["progress"]`, `["achievements"]`, `["xp"]`

#### Scenario: Unauthenticated complete attempt
- **WHEN** usuário sem token tenta completar lição
- **THEN** backend retorna 401 e frontend não exibe tela de resultado

---

### Requirement: Lesson Execution E2E Test
O sistema SHALL ter cobertura E2E (Playwright) cobrindo a jornada completa: abrir lição → responder todas as questões → ver resultado → verificar exibição de XP e navegação para home. API calls SHALL ser mockadas via `page.route()`.

**Arquivo**: `apps/web/e2e/lesson-execution.spec.ts`

#### Scenario: Complete lesson journey E2E
- **WHEN** usuário navega para `/lessons/[id]`, responde todas as questões e clica "Ver resultado →"
- **THEN** tela de resultado exibe XP ganho e botão "Próxima Lição →"

#### Scenario: Navigate home from result
- **WHEN** usuário clica "Voltar para Home" na tela de resultado
- **THEN** URL muda para `/dashboard`
