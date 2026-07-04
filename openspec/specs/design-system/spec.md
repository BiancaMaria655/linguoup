# Capability: Design System

## Purpose

Define e exportar os tokens de design e componentes de UI compartilhados do LinguoUp a partir do pacote `packages/ui`. O design system garante consistência visual, acessibilidade e reusabilidade em todos os apps do monorepo.

---

## Requirements

### Requirement: Design Tokens exportados como constantes TypeScript
O sistema SHALL exportar tokens de design imutáveis (`as const`) para cores, tipografia, espaçamento e sombras a partir de `packages/ui/src/tokens/`.

#### Scenario: Importar token de cor primária
- **WHEN** um componente importa `colors` de `@linguoup/ui`
- **THEN** `colors.primary` SHALL ter o valor `#4648d4`

#### Scenario: Importar token de espaçamento base
- **WHEN** um componente importa `spacing` de `@linguoup/ui`
- **THEN** `spacing.md` SHALL ter o valor `16` (px base 8)

#### Scenario: Importar token de tipografia
- **WHEN** um componente importa `typography` de `@linguoup/ui`
- **THEN** `typography.fontFamily` SHALL incluir `Nunito Sans` como fonte principal

---

### Requirement: Componente Button com variantes primário e secundário
O sistema SHALL fornecer um componente `Button` com variantes `primary` (pill, indigo) e `secondary` (outline) e estado `disabled`.

#### Scenario: Renderizar botão primário
- **WHEN** `<Button variant="primary" label="Continuar" />` é renderizado
- **THEN** o botão SHALL ter fundo `#4648d4`, texto branco e border-radius de 8px

#### Scenario: Renderizar botão desabilitado
- **WHEN** `<Button disabled label="Continuar" />` é renderizado
- **THEN** o botão SHALL ter opacidade reduzida e não responder ao toque (`onPress` não é chamado)

#### Scenario: Touch target mínimo
- **WHEN** qualquer variante de `Button` é renderizada
- **THEN** a altura mínima SHALL ser 44px e a largura mínima 44px (WCAG 2.1 AA)

---

### Requirement: Componente Input com estados de foco e erro
O sistema SHALL fornecer um componente `Input` com label, feedback de foco (borda indigo) e estado de erro.

#### Scenario: Foco no campo
- **WHEN** o usuário toca no componente `Input`
- **THEN** a borda SHALL mudar para `#4648d4` e o label SHALL se mover para cima (float label)

#### Scenario: Estado de erro
- **WHEN** a prop `error="Mensagem de erro"` é passada ao `Input`
- **THEN** o campo SHALL exibir borda vermelha (`#ba1a1a`) e a mensagem de erro abaixo do campo

---

### Requirement: Componente Card como container reutilizável
O sistema SHALL fornecer um componente `Card` com sombra suave e border-radius de 8px para agrupar conteúdo.

#### Scenario: Renderizar card com conteúdo
- **WHEN** `<Card>...</Card>` é renderizado com children
- **THEN** o card SHALL exibir os children dentro de um container com sombra e fundo branco (`#ffffff`)

---

### Requirement: Componente ProgressBar pill-shaped com fill verde
O sistema SHALL fornecer um componente `ProgressBar` que exibe progresso de 0–100% com fill verde mint.

#### Scenario: Progresso parcial
- **WHEN** `<ProgressBar value={60} />` é renderizado
- **THEN** a barra SHALL estar 60% preenchida com cor `#006c49`

#### Scenario: Progresso completo
- **WHEN** `<ProgressBar value={100} />` é renderizado
- **THEN** a barra SHALL estar 100% preenchida e SHALL exibir estado visual de conclusão

---

### Requirement: Componente Badge para XP, streak e nível
O sistema SHALL fornecer um componente `Badge` com variantes para XP, streak e nível de usuário.

#### Scenario: Renderizar badge de XP
- **WHEN** `<Badge type="xp" value={250} />` é renderizado
- **THEN** o badge SHALL exibir "+250 XP" com ícone de raio e cor primária

#### Scenario: Renderizar badge de streak
- **WHEN** `<Badge type="streak" value={7} />` é renderizado
- **THEN** o badge SHALL exibir "7 dias" com ícone de chama

---

### Requirement: Componente SkeletonLoader para estados de carregamento
O sistema SHALL fornecer um componente `SkeletonLoader` que exibe placeholders animados durante carregamento de dados.

#### Scenario: Skeleton de card
- **WHEN** `<SkeletonLoader variant="card" />` é renderizado
- **THEN** SHALL exibir retângulos animados (fade ou shimmer) no lugar do conteúdo real

---

### Requirement: Componente Toast para feedback positivo e negativo
O sistema SHALL fornecer um componente `Toast` com variantes de sucesso (verde) e erro (coral).

#### Scenario: Toast de sucesso
- **WHEN** `<Toast variant="success" message="Lição concluída!" />` é renderizado
- **THEN** o toast SHALL ter fundo verde, ícone de check e desaparecer após 3 segundos

#### Scenario: Toast de erro
- **WHEN** `<Toast variant="error" message="Algo deu errado" />` é renderizado
- **THEN** o toast SHALL ter fundo coral/vermelho e ícone de alerta

---

### Requirement: Componente AchievementCard com estados bloqueado e desbloqueado
O sistema SHALL fornecer um componente `AchievementCard` que exibe conquistas com estado visual distinto entre bloqueado e desbloqueado.

#### Scenario: Conquista desbloqueada
- **WHEN** `<AchievementCard unlocked title="Primeiro Passo" />` é renderizado
- **THEN** o card SHALL exibir ícone colorido, título e descrição em estilo destacado

#### Scenario: Conquista bloqueada
- **WHEN** `<AchievementCard unlocked={false} title="Mestre do Idioma" />` é renderizado
- **THEN** o card SHALL exibir ícone em cinza/monocromático com opacidade reduzida

---

### Requirement: Componente LessonCard com nível, tema e duração
O sistema SHALL fornecer um componente `LessonCard` exibindo metadados da lição (nível, tema, duração estimada).

#### Scenario: Renderizar card de lição
- **WHEN** `<LessonCard level="A1" theme="Saudações" duration={5} />` é renderizado
- **THEN** o card SHALL exibir nível, tema e "5 min" com layout Card e borda lateral colorida por nível

---

### Requirement: Componente OptionCard para seleção no onboarding
O sistema SHALL fornecer um componente `OptionCard` para seleção visual em flows de onboarding (objetivo, idioma, etc.).

#### Scenario: Selecionar opção
- **WHEN** o usuário toca em `<OptionCard label="Viagem" selected={false} />`
- **THEN** o card SHALL transitar para estado selecionado (borda indigo, fundo levemente colorido) e o callback `onSelect` SHALL ser chamado

#### Scenario: Opção já selecionada
- **WHEN** `<OptionCard label="Viagem" selected={true} />` é renderizado
- **THEN** o card SHALL exibir borda e fundo indigo com ícone de check visível

---

### Requirement: Barrel exports via packages/ui/index.ts
O sistema SHALL exportar todos os tokens e componentes de `packages/ui/index.ts` para consumo via `@linguoup/ui`.

#### Scenario: Importar componente do pacote
- **WHEN** um app importa `import { Button } from '@linguoup/ui'`
- **THEN** o componente `Button` SHALL estar disponível sem erros de importação

#### Scenario: Importar token do pacote
- **WHEN** um app importa `import { colors } from '@linguoup/ui'`
- **THEN** o objeto `colors` SHALL estar disponível com todos os tokens de cor definidos
