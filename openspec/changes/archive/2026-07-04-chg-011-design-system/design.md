## Context

O `packages/ui` é o pacote de componentes compartilhados do monorepo LinguoUp. Atualmente o diretório `src/` está vazio (nenhum token ou componente implementado). O Design System foi especificado visualmente no Stitch com o tema **Premium Playful Learning**: cor primária Electric Indigo (`#4648d4`), fonte Nunito Sans, arredondamentos de 8px e acentos Verde Mint (`#006c49`).

A proposta usa **NativeWind** (Tailwind CSS para React Native) para estilização dos componentes, garantindo alinhamento com a stack web (Next.js + Tailwind CSS) e minimizando divergência de tokens entre plataformas.

Estado atual:
- `packages/ui/index.ts` existe mas está sem exports úteis.
- `packages/ui/src/{tokens,components}/` são diretórios ainda sem arquivos.
- Nenhum componente foi criado; nenhum token foi exportado.

---

## Goals / Non-Goals

**Goals:**
- Criar tokens de design (cores, tipografia, espaçamento, sombras) como constantes TypeScript exportadas.
- Implementar os 12 componentes React Native especificados na proposta, usando NativeWind para estilização.
- Garantir barrel exports corretos via `packages/ui/index.ts`.
- Cada componente deve ter mínimo de 80% de cobertura de testes unitários.
- Todos os touch targets devem ter mínimo de 44×44px (WCAG 2.1 AA).

**Non-Goals:**
- Componentes web (Next.js/React DOM) — escopo do CHG-013.
- Temas dark mode — postergado para V2.
- Animações complexas (Reanimated, Lottie) — fase de polimento.
- Storybook ou showcase app — pode ser adicionado separadamente.
- Componentes de exercícios específicos — escopo do CHG-012.

---

## Decisions

### D1: NativeWind como sistema de estilização

**Decisão:** Usar NativeWind v4 para estilização de todos os componentes.

**Alternativas consideradas:**
- `StyleSheet.create` puro: mais verboso, sem vínculo direto com tokens Tailwind da web.
- Styled-components/Emotion: overhead desnecessário, não alinhado com a stack existente.

**Rationale:** O projeto web já usa Tailwind CSS. NativeWind permite compartilhar classes utilitárias (ou pelo menos classes semelhantes) entre web e mobile, reduzindo divergência de design. Tokens de cor e tipografia continuam definidos em TypeScript (`tokens/`) para uso em ambos os ambientes.

---

### D2: Tokens em TypeScript puro (sem dependência de runtime)

**Decisão:** Definir tokens como objetos TypeScript (`as const`) exportados de `tokens/`.

**Alternativas consideradas:**
- CSS custom properties: não funciona nativamente em React Native.
- Arquivo JSON compartilhado: possível, mas adiciona complexidade de parsing e tipagem.

**Rationale:** Objetos `as const` são tree-shakeable, tipados estaticamente e simples de consumir tanto em React Native (`style` props) quanto em qualquer utilitário web. NativeWind cuida da tradução de classes para `StyleSheet` em runtime.

---

### D3: Estrutura de arquivos flat por tipo

**Decisão:** Separar tokens em `src/tokens/` e componentes em `src/components/`, com barrel `index.ts` na raiz do pacote.

**Alternativas consideradas:**
- Estrutura feature-based: faz sentido para apps, não para bibliotecas de componentes atômicos.
- Um único arquivo por componente com tokens inlined: dificulta reuso e manutenção.

**Rationale:** Componentes de um design system são atômicos e independentes de feature. Separação plana por tipo é o padrão de mercado (Radix, shadcn, RN Paper).

---

### D4: Sem lógica de negócio nos componentes

**Decisão:** Todos os componentes em `packages/ui` são puramente visuais — recebem dados via props e emitem eventos via callbacks. Nenhum hook de API, nenhum acesso a store Zustand.

**Rationale:** `packages/*` não pode depender de `apps/*`. Lógica de negócio fica nas telas dos apps. Garante reusabilidade e testabilidade isolada.

---

## Risks / Trade-offs

| Risco | Mitigação |
|---|---|
| NativeWind v4 ainda em evolução — possíveis breaking changes | Fixar versão no `package.json`; não usar APIs experimentais |
| Componentes sem showcase podem ter comportamento visual incerto | Criar testes de snapshot com Jest + `@testing-library/react-native` |
| Divergência visual entre web (Tailwind) e mobile (NativeWind) | Tokens TypeScript compartilhados garantem consistência de valores |
| `packages/ui` sem `peerDependencies` adequadas pode gerar conflitos | Declarar React Native e NativeWind como `peerDependencies` no `package.json` |
| Testes unitários de componentes visuais têm valor limitado sem visual regression | Aceito para MVP; Chromatic ou Percy podem ser adicionados em V2 |

---

## Migration Plan

1. Adicionar NativeWind como `devDependency` e `peerDependency` em `packages/ui/package.json` (requer aprovação conforme AGENTS.md §7).
2. Criar tokens (`colors`, `typography`, `spacing`, `shadows`) em `src/tokens/`.
3. Implementar componentes em `src/components/`, um por um.
4. Atualizar `packages/ui/index.ts` com barrel exports de todos tokens e componentes.
5. Executar `pnpm lint && pnpm typecheck && pnpm test && pnpm build` para validar.

**Rollback:** Pacote isolado — nenhum app depende de `packages/ui` ainda (nenhum import existente em `apps/web` ou `apps/api`). Reversão é trivial via git.

---

## Open Questions

1. **NativeWind já está instalado no workspace?** Se sim, qual versão? (Verificar antes de adicionar dependência.)
2. **`StreakIcon` usa ícone SVG ou emoji?** A proposta menciona "ícone de chama" — SVG preferível para acessibilidade, mas exige `react-native-svg` como dependência.
3. **`BottomSheet` usa lib externa** (ex: `@gorhom/bottom-sheet`) **ou implementação customizada?** Lib externa adiciona dependência pesada; implementação customizada pode ser suficiente para MVP.
