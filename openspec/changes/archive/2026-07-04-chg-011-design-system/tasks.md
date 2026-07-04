## 1. Setup e Dependências

- [x] 1.1 Verificar se NativeWind já está instalado no workspace (`pnpm list nativewind`); se não, solicitar aprovação e adicionar como `peerDependency` + `devDependency` em `packages/ui/package.json`
- [x] 1.2 Verificar se `@testing-library/react-native` e `jest` estão configurados em `packages/ui`; adicionar se ausentes (com aprovação)
- [x] 1.3 Criar diretórios `packages/ui/src/tokens/` e `packages/ui/src/components/` se ainda não existirem

## 2. Design Tokens

- [x] 2.1 Criar `packages/ui/src/tokens/colors.ts` com tokens: `primary` (`#4648d4`), `secondary` (`#006c49`), `background` (`#fcf8ff`), `surface` (`#ffffff`), `error` (`#ba1a1a`) e variantes semânticas
- [x] 2.2 Criar `packages/ui/src/tokens/typography.ts` com `fontFamily` (`Nunito Sans`), pesos (`headline: 800`, `body: 400`, `label: 700`) e tamanhos de escala
- [x] 2.3 Criar `packages/ui/src/tokens/spacing.ts` com base 8px: `xs: 4`, `sm: 12`, `md: 16`, `lg: 24`, `xl: 32`
- [x] 2.4 Criar `packages/ui/src/tokens/shadows.ts` com sombra suave padrão para Card e Bottom Sheet
- [x] 2.5 Criar `packages/ui/src/tokens/index.ts` re-exportando todos os tokens

## 3. Componentes Atômicos

- [x] 3.1 Implementar `packages/ui/src/components/Button.tsx` — variantes `primary`, `secondary`, `disabled`; altura mínima 44px; usar tokens de cor e espaçamento
- [x] 3.2 Implementar `packages/ui/src/components/Input.tsx` — label flutuante, borda indigo no foco, estado de erro (`#ba1a1a`), prop `error?: string`
- [x] 3.3 Implementar `packages/ui/src/components/Card.tsx` — container com sombra (`shadows.sm`), border-radius 8px, fundo `colors.surface`
- [x] 3.4 Implementar `packages/ui/src/components/ProgressBar.tsx` — pill-shaped, fill verde mint, prop `value: number` (0–100)
- [x] 3.5 Implementar `packages/ui/src/components/Badge.tsx` — variantes `xp`, `streak`, `level` com ícone e valor numérico

## 4. Componentes Compostos

- [x] 4.1 Implementar `packages/ui/src/components/SkeletonLoader.tsx` — variantes `card` e `list`; animação de shimmer com `Animated.loop`
- [x] 4.2 Implementar `packages/ui/src/components/Toast.tsx` — variantes `success` (verde) e `error` (coral); auto-dismiss em 3s; prop `message: string`
- [x] 4.3 Implementar `packages/ui/src/components/BottomSheet.tsx` — implementação customizada com `Animated` (sem deps externas); props `visible`, `onClose`, `children`
- [x] 4.4 Implementar `packages/ui/src/components/AchievementCard.tsx` — estados `unlocked` (colorido) e `locked` (cinza/opacidade); props `title`, `description`, `icon`
- [x] 4.5 Implementar `packages/ui/src/components/LessonCard.tsx` — borda lateral colorida por nível; props `level`, `theme`, `duration`
- [x] 4.6 Implementar `packages/ui/src/components/OptionCard.tsx` — estado selecionado (borda e fundo indigo + ícone check); props `label`, `selected`, `onSelect`

## 5. Barrel Exports

- [x] 5.1 Criar `packages/ui/src/components/index.ts` re-exportando todos os componentes
- [x] 5.2 Atualizar `packages/ui/index.ts` para re-exportar tudo de `src/tokens/index.ts` e `src/components/index.ts`
- [x] 5.3 Verificar que `import { Button, colors } from '@linguoup/ui'` funciona sem erros de tipos (`pnpm typecheck`)

## 6. Testes Unitários

- [x] 6.1 Escrever testes para `Button`: renderiza variantes, chama `onPress`, não chama `onPress` quando `disabled`, touch target ≥ 44px
- [x] 6.2 Escrever testes para `Input`: exibe label, exibe mensagem de erro, muda estilo no foco
- [x] 6.3 Escrever testes para `ProgressBar`: valor 0, 60, 100 renderiza fill correto
- [x] 6.4 Escrever testes para `Badge`: cada variante (`xp`, `streak`, `level`) renderiza valor e label corretos
- [x] 6.5 Escrever testes para `OptionCard`: estado selecionado vs. não selecionado, callback `onSelect`
- [x] 6.6 Escrever testes para `AchievementCard`: estado `unlocked` vs. `locked`
- [x] 6.7 Escrever testes para `Toast`: `success`, `error`, auto-dismiss após 3s
- [x] 6.8 Escrever testes para tokens: verificar valores exportados de `colors`, `spacing`, `typography`
- [x] 6.9 Garantir cobertura ≥ 80% em todos os componentes (`pnpm test --coverage`)

## 7. Validação Final

- [x] 7.1 Executar `pnpm lint` no workspace e corrigir todos os warnings/errors
- [x] 7.2 Executar `pnpm typecheck` e corrigir todos os erros de tipo
- [x] 7.3 Executar `pnpm test` e garantir que todos os testes passam
- [x] 7.4 Executar `pnpm build` e verificar que o pacote `@linguoup/ui` compila sem erros
- [x] 7.5 Confirmar que nenhum componente importa de `apps/*` (ausência de dependências circulares)
