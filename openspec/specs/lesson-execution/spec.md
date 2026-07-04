# Spec: Lesson Execution

## Purpose

Defines the behavior of the lesson execution module in the web client. Covers the stateful hook that manages a microlição session and the page that renders the step-by-step exercise flow.

---

## Requirements

### Requirement: Lesson Execution Hook
O sistema SHALL fornecer um hook `useLessonExecution` que encapsula todo o estado e lógica da sessão de microlição. O hook gerencia: questão atual, respostas do usuário, feedbacks (correto/incorreto), timer decorrido em segundos, exibição de dica e submissão de resposta. O componente de UI não conterá lógica de negócio — apenas renderização.

**Hook**: `apps/web/app/hooks/useLessonExecution.ts`
**RBAC**: N/A (estado local, sem chamadas autônomas de API)
**Interface de retorno**:
```ts
{
  session: {
    current: number;
    answers: string[];
    feedbacks: boolean[];
    startTime: number;
    showFeedback: boolean;
    selectedOption: string | null;
    fillInput: string;
  };
  elapsedSeconds: number;
  showHint: boolean;
  score: number;
  correctPct: number;
  isDone: boolean;
  handleAnswer: (answer: string) => void;
  handleNext: (total: number, onComplete: (score: number, time: number) => void) => void;
  setShowHint: (v: boolean | ((prev: boolean) => boolean)) => void;
  setFillInput: (v: string) => void;
}
```

#### Scenario: Submit correct answer
- **WHEN** `handleAnswer` é chamado com string igual a `exercise.correctAnswer` (case-insensitive, trimmed)
- **THEN** `session.feedbacks` recebe `true` e `session.showFeedback` torna-se `true`

#### Scenario: Submit incorrect answer
- **WHEN** `handleAnswer` é chamado com string diferente de `exercise.correctAnswer`
- **THEN** `session.feedbacks` recebe `false` e `session.showFeedback` torna-se `true`

#### Scenario: Navigate to next question
- **WHEN** `handleNext` é chamado e `session.current + 1 < total`
- **THEN** `session.current` incrementa, `showFeedback` reseta para `false`, `selectedOption` e `fillInput` resetam para valores vazios

#### Scenario: Trigger lesson completion
- **WHEN** `handleNext` é chamado e `session.current + 1 >= total`
- **THEN** callback `onComplete` é chamado com `(correctPct, timeSpentSeconds)` e `session.current` avança para `total`

#### Scenario: Timer increments every second
- **WHEN** hook é montado
- **THEN** `elapsedSeconds` incrementa 1 por segundo via `setInterval`

#### Scenario: Timer clears on unmount
- **WHEN** componente que usa o hook é desmontado
- **THEN** `clearInterval` é chamado para o intervalo do timer

---

### Requirement: Lesson Execution Page
O sistema SHALL renderizar a página de execução de microlição na rota `/lessons/[id]` utilizando o hook `useLessonExecution`. A página exibe: barra de progresso superior, timer visual (MM:SS decorrido), questão atual com tipo de exercício, opções de resposta ou campo de texto, botão "Ver Dica" e feedback imediato após resposta. Exige autenticação (redireciona para `/login` se sem token).

**Rota**: `/lessons/[id]`
**RBAC**: `USER` (JWT requerido)
**Endpoint consumido**: `GET /api/v1/lessons/{id}`

#### Scenario: Display lesson with multiple choice exercise
- **WHEN** usuário acessa `/lessons/[id]` e lição tem exercício `type: "multiple_choice"`
- **THEN** sistema exibe as opções como botões clicáveis com borda `var(--surface-border)`

#### Scenario: Display lesson with fill-in-blank exercise
- **WHEN** lição tem exercício `type: "fill_blank"`
- **THEN** sistema exibe campo de texto com placeholder "Complete a frase…" e botão "Verificar" ao digitar

#### Scenario: Display lesson with translation exercise
- **WHEN** lição tem exercício `type: "translation"`
- **THEN** sistema exibe campo de texto com placeholder "Digite a tradução…" e botão "Verificar" ao digitar

#### Scenario: Show correct feedback
- **WHEN** usuário seleciona a resposta correta
- **THEN** opção/campo exibe borda verde (`rgba(34,197,94,0.5)`) e feedback "✅ Correto!" aparece

#### Scenario: Show incorrect feedback
- **WHEN** usuário seleciona resposta incorreta
- **THEN** opção incorreta exibe borda coral/vermelha, resposta correta é destacada em verde, e feedback "❌ Incorreto" com `exercise.correctAnswer` aparece

#### Scenario: Show hint
- **WHEN** usuário clica "💡 Ver dica" (exercício tem campo `hint`)
- **THEN** painel de dica aparece abaixo do enunciado com texto de `exercise.hint`

#### Scenario: Continue to next question
- **WHEN** feedback está visível e usuário clica "Continuar →"
- **THEN** próxima questão é exibida sem feedback, barra de progresso avança

#### Scenario: Pause lesson
- **WHEN** usuário clica "✕" no topo
- **THEN** router navega para `/lessons`

#### Scenario: Timer display updates every second
- **WHEN** página está ativa
- **THEN** timer na barra superior exibe MM:SS incrementando a cada segundo

#### Scenario: Lesson not found
- **WHEN** API retorna 404 ou array vazio de exercícios
- **THEN** mensagem "Lição não encontrada." é exibida

#### Scenario: Loading state
- **WHEN** query de lição está em `isLoading = true`
- **THEN** skeleton da lição (`LessonSkeleton`) é renderizado
