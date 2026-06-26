# CHG-014 — Web Client: Execução de Lição & Resultado (INT-13, INT-14)

## Versão do Roadmap
**V1 — MVP**

## Descrição
Implementação das telas de execução de microlição e tela de resultado no Next.js Web Client. A execução de lição é o fluxo central do produto: apresenta exercícios, valida respostas, exibe feedback e ao final registra a conclusão via API (CHG-006) com atualização de XP e streak.

## Contexto
Dependências: CHG-006 (lessons API — `complete`), CHG-008 (gamification — `newAchievements`), CHG-011 (design system), CHG-013 (home dashboard — navegação). Os protótipos de referência no Stitch são **"Microlição em Curso"** (mobile viewport).

## Telas Implementadas

| Interface | Tela Stitch de Referência | Screen ID |
|-----------|---------------------------|-----------|
| INT-13 Execução da Microlição | "Microlição em Curso" | `b09a4f66078b4f1db799d79f53fedb1e` |
| INT-14 Resultado da Lição | — (tela de resultado com XP e conquistas) | — |

## Escopo

### O que está incluído

**Execução da Microlição (INT-13) - Rota `/lessons/[id]`:**
- Barra de progresso superior (questões restantes)
- Timer visual (3–5 min target)
- Renderização de tipos de exercício responsivos:
  - Múltipla escolha (palavra/frase)
  - Completar a frase
  - Tradução simples
- Feedback imediato por resposta (verde = correto, coral = incorreto + explicação)
- Botão "Ver Dica"
- Botão "Pausar" (salva posição local)
- Navegação: "Continuar" após feedback

**Resultado da Lição (INT-14) - Rota `/lessons/[id]/result`:**
- XP ganho (animação de contagem)
- Acertos e erros
- Barra de progresso geral atualizada
- Novas conquistas desbloqueadas (modal/toast)
- Streak atualizado
- Botões: "Próxima Lição", "Revisar Conteúdo", "Voltar para Home"

**Chamada de API:**
- `POST /api/v1/lessons/{id}/complete` com `score` e `timeSpentSeconds`
- Mutação TanStack Query com invalidação de cache de progresso, XP e achievements

**State Management:**
- `useLessonExecution` hook — gerencia estado local da sessão de lição (questão atual, respostas, score)
- Zustand: sem estado global para sessão (local ao componente)

**Testes:**
- Unitários: hook `useLessonExecution` (lógica de score, navegação entre questões)
- E2E (Playwright): jornada completa "abrir lição → responder questões → ver resultado → ver conquista"

### Non-goals
- Tipos de exercício avançados (áudio, escrita livre — V2)
- Modo offline (V2)
- Feedback de fala/pronúncia (V3)
- Retomada de lição após fechar página (V2)

## Tamanho, Complexidade e Risco
| Dimensão    | Avaliação | Justificativa |
|-------------|-----------|---------------|
| Tamanho     | Médio     | 2 rotas com lógica de sessão + 3 tipos de exercício |
| Complexidade| Média     | Estado local de sessão + feedback em tempo real + mutação de API |
| Risco       | Médio     | Fluxo central do produto; E2E obrigatório |

## Plano de Verificação
```bash
pnpm dev --filter=web
pnpm test --filter=web
# Testar: abrir lição → responder todas as questões → ver resultado
# Verificar que XP e streak atualizam após completar lição
# Verificar que novas conquistas são exibidas na tela de resultado
# Testar feedback imediato (correto/incorreto) sem delay perceptível
```
