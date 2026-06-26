# CHG-015 — Web Client: Progresso, Streak, Revisões & Gamificação (INT-15 a INT-18)

## Versão do Roadmap
**V1 — MVP**

## Descrição
Implementação das telas de formação de hábito, gamificação, revisões de repetição espaçada e dashboard de progresso detalhado no Next.js Web Client. Completa as abas "Revisões" e "Progresso" do portal do aluno.

## Contexto
Dependências: CHG-007 (progress/streak API), CHG-008 (gamification API), CHG-009 (reviews API), CHG-011 (design system), CHG-013 (navegação principal). Os protótipos de referência no Stitch (projeto `projects/13167686388520823014`):
- `47c6cf61dbd64036ac4f62208b1d46da` — **Dashboard de Progresso** (mobile viewport, 390×1319px)
- `8463ee2535f4421d9a97c1ffa3061744` — **Perfil e Conquistas** (mobile viewport, 390×1566px)
- `8b7953df6d57444f9c5c1a756a078537` — **Revisões** (mobile viewport, 441×1256px)

## Telas Implementadas

| Interface | Tela Stitch de Referência | Screen ID |
|-----------|---------------------------|-----------|
| INT-15 Streak e Metas | — (calendário + streak) | — |
| INT-16 Conquistas e Gamificação | Perfil e Conquistas | `8463ee2535f4421d9a97c1ffa3061744` |
| INT-17 Revisões (Repetição Espaçada) | Revisões | `8b7953df6d57444f9c5c1a756a078537` |
| INT-18 Dashboard de Progresso | Dashboard de Progresso | `47c6cf61dbd64036ac4f62208b1d46da` |

## Escopo

### O que está incluído

**INT-15 — Streak e Metas - Rota `/reviews` ou `/dashboard`:**
- Sequência atual com ícone de chama animado
- Melhor sequência histórica
- Calendário de atividades (últimos 30 dias, dias ativos marcados)
- Meta diária atual + botão "Alterar Meta" (abre modal responsivo)
- Modal para editar meta: slider de minutos diários

**INT-16 — Conquistas e Gamificação - Rota `/profile`:**
- Nível atual + XP total + barra de progresso para próximo nível
- Grid de conquistas (desbloqueadas em cor, bloqueadas em cinza)
- Detalhes ao passar o cursor ou tocar na conquista bloqueada (exibe critério)

**INT-17 — Revisões (Repetição Espaçada) - Rota `/reviews`:**
- Lista de itens pendentes com prioridade visual (vencimento)
- Botão "Revisar Agora" → inicia sessão de revisão (fluxo similar à execução de lição)
- Botão "Adiar" (adia item para o dia seguinte)
- Badge com contagem de itens vencidos

**INT-18 — Dashboard de Progresso - Rota `/progress`:**
- Lições concluídas (total e semana)
- Tempo estudado (gráfico de barras responsivo usando SVG puro ou componentes gráficos leves)
- Evolução semanal e mensal
- Vocabulário aprendido
- Filtro de período (7, 30, 90 dias)

**Testes:**
- Unitários: hook `useStreakScreen`, `useReviewSession`
- E2E (Playwright): jornada "ver progresso → ver streak → iniciar revisão → completar revisão"

### Non-goals
- Rankings entre usuários (V3)
- Exportação de dados de progresso (V4)
- Gráficos de retenção de vocabulário (V2)

## Tamanho, Complexidade e Risco
| Dimensão    | Avaliação | Justificativa |
|-------------|-----------|---------------|
| Tamanho     | Médio     | 4 rotas com integração de múltiplas APIs |
| Complexidade| Média     | Gráficos responsivos + sessão de revisão + calendário |
| Risco       | Baixo/Médio | Telas majoritariamente de leitura; revisão é fluxo de session |

## Plano de Verificação
```bash
pnpm dev --filter=web
pnpm test --filter=web
# Testar: alterar meta → verificar persistência via API
# Testar: iniciar sessão de revisão → completar → verificar próximo intervalo
# Verificar gráficos de progresso com dados reais
# Verificar calendário de streak: dias ativos marcados corretamente
```
