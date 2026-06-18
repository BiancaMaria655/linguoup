# CHG-015 — Mobile: Progresso, Streak, Revisões & Gamificação (INT-15 a INT-18)

## Versão do Roadmap
**V1 — MVP**

## Descrição
Implementação das telas de formação de hábito, gamificação, revisões de repetição espaçada e dashboard de progresso detalhado no app React Native. Completa as abas "Revisões" e "Progresso" da navegação principal.

## Contexto
Dependências: CHG-007 (progress/streak API), CHG-008 (gamification API), CHG-009 (reviews API), CHG-011 (design system), CHG-013 (navegação principal). Os protótipos de referência no Stitch (projeto `projects/13167686388520823014`):
- `47c6cf61dbd64036ac4f62208b1d46da` — **Dashboard de Progresso** (mobile, 390×1319px)
- `8463ee2535f4421d9a97c1ffa3061744` — **Perfil e Conquistas** (mobile, 390×1566px)
- `8b7953df6d57444f9c5c1a756a078537` — **Revisões** (441×1256px)

## Telas Implementadas

| Interface | Tela Stitch de Referência | Screen ID |
|-----------|---------------------------|-----------|
| INT-15 Streak e Metas | — (calendário + streak) | — |
| INT-16 Conquistas e Gamificação | Perfil e Conquistas (mobile) | `8463ee2535f4421d9a97c1ffa3061744` |
| INT-17 Revisões (Repetição Espaçada) | Revisões | `8b7953df6d57444f9c5c1a756a078537` |
| INT-18 Dashboard de Progresso | Dashboard de Progresso (mobile) | `47c6cf61dbd64036ac4f62208b1d46da` |

## Escopo

### O que está incluído

**INT-15 — Streak e Metas:**
- Sequência atual com ícone de chama animado
- Melhor sequência histórica
- Calendário de atividades (últimos 30 dias, dias ativos em verde)
- Meta diária atual + botão "Alterar Meta" (abre BottomSheet)
- BottomSheet para editar meta: slider de minutos diários

**INT-16 — Conquistas e Gamificação:**
- Nível atual + XP total + barra de progresso para próximo nível
- Grid de conquistas (desbloqueadas em cor, bloqueadas em cinza)
- Ao tocar em conquista bloqueada: mostra critério para desbloquear

**INT-17 — Revisões (Repetição Espaçada):**
- Lista de itens pendentes com prioridade visual (vencimento)
- Botão "Revisar Agora" → inicia sessão de revisão (fluxo similar à execução de lição)
- Botão "Adiar" (adia item para o dia seguinte)
- Badge com contagem de itens vencidos

**INT-18 — Dashboard de Progresso:**
- Lições concluídas (total e semana)
- Tempo estudado (gráfico de barras semanal com `react-native-chart-kit`)
- Evolução semanal e mensal
- Vocabulário aprendido
- Filtro de período (7, 30, 90 dias)

**Testes:**
- Unitários: hooks `useStreakScreen`, `useReviewSession`
- E2E: jornada "ver progresso → ver streak → iniciar revisão → completar revisão"

### Non-goals
- Rankings entre usuários (V3)
- Exportação de dados de progresso (V4)
- Gráficos de retenção de vocabulário (V2)
- Adiar revisão com data personalizada (V2)

## Tamanho, Complexidade e Risco
| Dimensão    | Avaliação | Justificativa |
|-------------|-----------|---------------|
| Tamanho     | Médio     | 4 telas com integração de múltiplas APIs |
| Complexidade| Média     | Gráficos + sessão de revisão + calendário |
| Risco       | Baixo/Médio | Telas majoritariamente de leitura; revisão é fluxo derivado da lição |

## Plano de Verificação
```bash
pnpm dev --filter=mobile
pnpm test --filter=mobile
# Testar: alterar meta → verificar persistência via API
# Testar: iniciar sessão de revisão → completar → verificar próximo intervalo
# Verificar gráficos de progresso com dados reais
# Verificar calendário de streak: dias ativos marcados corretamente
```
