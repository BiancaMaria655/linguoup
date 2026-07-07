# CHG-013 — Web Client: Home Dashboard & Navegação Principal (INT-10, INT-11, INT-12)

## Versão do Roadmap
**V1 — MVP**

## Descrição
Implementação da Home Dashboard (tela principal do aluno), Catálogo de Trilhas e Detalhe da Trilha no Next.js Web Client. Inclui a navegação principal do aplicativo (sidebar/menu responsivo) com 5 áreas principais: Início, Trilhas, Revisões, Progresso e Perfil.

## Contexto
Dependências: CHG-006 (lessons API), CHG-007 (progress API), CHG-008 (gamification API), CHG-011 (design system), CHG-012 (auth/onboarding). Os protótipos de referência no Stitch (projeto `projects/13167686388520823014`):
- `8e7b4d201cab4e45b1c403f5fff095b2` — **Home Dashboard** (mobile viewport, 390×884px)

## Telas Implementadas

| Interface | Tela Stitch de Referência | Screen ID |
|-----------|---------------------------|-----------|
| INT-10 Home Dashboard | Home Dashboard | `8e7b4d201cab4e45b1c403f5fff095b2` |
| INT-11 Catálogo de Trilhas | — (lista de trilhas com níveis) | — |
| INT-12 Detalhe da Trilha | — (lista de lições da trilha) | — |

## Escopo

### O que está incluído

**Navegação principal:**
- Layout responsivo (`(client)/layout.tsx`) com sidebar fixa em desktop e barra inferior ou menu hambúrguer em mobile, contendo links para:
  - Início → `(client)/dashboard`
  - Trilhas → `(client)/lessons`
  - Revisões → `(client)/reviews` (placeholder — CHG-015 implementa)
  - Progresso → `(client)/progress` (placeholder — CHG-015 implementa)
  - Perfil → `(client)/profile` (placeholder — CHG-016 implementa)

**Home Dashboard (INT-10):**
- Saudação personalizada com nome do usuário
- Streak atual + ícone de chama
- XP acumulado
- Barra de progresso da meta diária
- Card "Continuar Lição" (próxima lição recomendada)
- Card "Revisões Pendentes" (contador)
- Skeleton loading durante fetch

**Catálogo de Trilhas (INT-11):**
- Lista de `LessonCard` agrupados por nível/tema
- Filtro por nível (Iniciante, Básico, Intermediário)

**Detalhe da Trilha (INT-12):**
- Cabeçalho com nome, descrição, progresso visual
- Lista de lições com status (concluída, próxima, bloqueada)
- Botão "Iniciar próxima lição"

**State Management:**
- TanStack Query: `useHomeData`, `useLessons`, `useTrailDetail`
- Zustand: `authStore` (dados do usuário autenticado)

**Testes:**
- Unitários: hook `useHomeData`
- E2E (Playwright): jornada "abrir site → ver dashboard → navegar para trilhas → abrir trilha"

### Non-goals
- Execução de lição (CHG-014)
- Telas de Revisões e Progresso (CHG-015)
- Tela de Perfil completa (CHG-016)

## Tamanho, Complexidade e Risco
| Dimensão    | Avaliação | Justificativa |
|-------------|-----------|---------------|
| Tamanho     | Médio     | 3 telas + layout responsivo |
| Complexidade| Baixa/Média | Composição de componentes responsivos + TanStack Query |
| Risco       | Baixo     | Telas de leitura; sem operações de escrita complexas |

## Plano de Verificação
```bash
pnpm dev --filter=web
pnpm test --filter=web
# Verificar que dashboard exibe dados reais do usuário (XP, streak, meta)
# Verificar skeleton loading durante fetch
# Verificar navegação responsiva em desktop e mobile
```
