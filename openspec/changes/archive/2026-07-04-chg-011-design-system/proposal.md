# CHG-011 — Design System & Componentes Mobile (packages/ui)

## Versão do Roadmap
**V1 — MVP**

## Descrição
Implementação do Design System base no `packages/ui`: tokens de design (cores, tipografia, espaçamento), componentes React Native reutilizáveis e NativeWind (Tailwind CSS para React Native). Estes componentes são compartilhados por todas as telas do app mobile.

## Contexto
Dependências: CHG-001 (monorepo). O Design System segue a especificação visual do Stitch (cor primária `#4648d4`, fonte Nunito Sans, roundness 8px, tema Premium Playful Learning). Os componentes são baseados nas telas prototipadas no Stitch e na `spec_ui.md`.

## Design System (baseado no Stitch LinguoUp)

**Cores principais:**
- Primary: `#4648d4` (Electric Indigo)
- Secondary: `#006c49` (Verde Mint)
- Background: `#fcf8ff`
- Surface: `#ffffff`
- Error: `#ba1a1a`

**Tipografia:** Nunito Sans (headline 800, body 400, label 700)

**Espaçamento:** base 8px (xs: 4, sm: 12, md: 16, lg: 24, xl: 32)

## Escopo

### Componentes incluídos (`packages/ui/src/`)

| Componente        | Descrição |
|-------------------|-----------|
| `Button`          | Primário (pill, indigo), secundário (outline), desabilitado |
| `Input`           | Campo de texto com label, foco (borda indigo), erro |
| `Card`            | Container com sombra suave, rounded-lg |
| `ProgressBar`     | Barra pill-shaped, fill verde mint |
| `Badge`           | XP badge, streak badge, nível badge |
| `StreakIcon`       | Ícone de chama com número |
| `SkeletonLoader`  | Loading state para cards e listas |
| `Toast`           | Feedback positivo (verde) e negativo (coral) |
| `BottomSheet`     | Sheet de confirmação e detalhes |
| `AchievementCard` | Card de conquista (bloqueado/desbloqueado) |
| `LessonCard`      | Card de lição com nível, tema, duração |
| `OptionCard`      | Card de seleção (onboarding) |

### Tokens de design (`packages/ui/src/tokens/`)
- `colors.ts`
- `typography.ts`
- `spacing.ts`
- `shadows.ts`

### Non-goals
- Componentes web (Next.js admin — CHG-013)
- Animações complexas (fase de polimento)
- Componentes de exercícios específicos (incluídos nas telas — CHG-012)
- Temas dark mode (V2)

## Arquivos Afetados

### [NEW] `packages/ui/src/tokens/colors.ts`
### [NEW] `packages/ui/src/tokens/typography.ts`
### [NEW] `packages/ui/src/tokens/spacing.ts`
### [NEW] `packages/ui/src/components/Button.tsx`
### [NEW] `packages/ui/src/components/Input.tsx`
### [NEW] `packages/ui/src/components/Card.tsx`
### [NEW] `packages/ui/src/components/ProgressBar.tsx`
### [NEW] `packages/ui/src/components/Badge.tsx`
### [NEW] `packages/ui/src/components/SkeletonLoader.tsx`
### [NEW] `packages/ui/src/components/Toast.tsx`
### [NEW] `packages/ui/src/components/BottomSheet.tsx`
### [NEW] `packages/ui/src/components/AchievementCard.tsx`
### [NEW] `packages/ui/src/components/LessonCard.tsx`
### [NEW] `packages/ui/src/components/OptionCard.tsx`
### [NEW] `packages/ui/src/index.ts` (barrel exports)

## Tamanho, Complexidade e Risco
| Dimensão    | Avaliação | Justificativa |
|-------------|-----------|---------------|
| Tamanho     | Médio     | ~14 componentes + tokens |
| Complexidade| Baixa/Média | Componentes visuais sem lógica de negócio; NativeWind |
| Risco       | Baixo     | Componentes isolados, sem dependências de backend |

## Plano de Verificação
```bash
pnpm lint && pnpm typecheck && pnpm build
# Renderizar cada componente em um Storybook ou tela de showcase
# Verificar acessibilidade: touch targets >= 44x44px, textos alternativos
```
