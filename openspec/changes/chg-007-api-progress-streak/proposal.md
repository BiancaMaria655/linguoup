# CHG-007 — API: Progresso & Streak (Progress Domain)

## Versão do Roadmap
**V1 — MVP**

## Descrição
Implementação do domínio de progresso e streak no backend NestJS: consulta de progresso geral, histórico de streak, metas diárias e indicadores de formação de hábito. Os dados são gerados pela transação de conclusão de lição (CHG-006) e expostos aqui como endpoints de leitura.

## Contexto
Dependências: CHG-006 (lições). O progresso é persistido atomicamente junto com a conclusão de lição. Esta mudança expõe os dados para as interfaces mobile e web. Inclui atualização de meta diária pelo usuário.

## Escopo

### O que está incluído

**Endpoints protegidos:**
- `GET /api/v1/progress` — progresso geral (totalXP, nível atual, lições concluídas, tempo estudado, vocabulário aprendido, evolução semanal e mensal)
- `GET /api/v1/streak` — streak atual, maior streak, histórico de atividade (calendário)
- `PATCH /api/v1/users/me/goals` — atualizar meta diária de lições/minutos

**Lógica de streak:**
- Streak incrementa se usuário concluiu ≥ 1 lição no dia
- Streak zera se passa 1 dia sem atividade (verificado no momento de login ou abertura do app)
- Maior streak histórico nunca decresce

**Testes:**
- Unitários: `StreakCalculationService` (casos: streak mantido, streak zerado, streak aumentado)
- Integração: completar lição → verificar streak e progresso atualizados
- E2E: jornada "ver progresso semanal"

### Non-goals
- Dashboard analítico avançado (V2 — gráficos detalhados, exportação)
- Ranking entre usuários (V3)
- Repetição espaçada (CHG-009)

## Endpoints OpenAPI

```yaml
GET /api/v1/progress:
  auth: Bearer
  response:
    data:
      totalXP: int
      currentLevel: int
      lessonsCompleted: int
      minutesStudied: int
      vocabularyLearned: int
      weeklyActivity: [{ date, lessonsCompleted, minutesStudied }]
      monthlyActivity: [{ week, lessonsCompleted }]

GET /api/v1/streak:
  auth: Bearer
  response:
    data:
      currentStreak: int
      longestStreak: int
      lastActivityDate: date
      activityCalendar: [{ date, active: bool }]  # últimos 30 dias

PATCH /api/v1/users/me/goals:
  auth: Bearer
  request: { dailyGoalMinutes?, dailyGoalLessons? }
  response: { data: { dailyGoalMinutes, dailyGoalLessons, updatedAt } }
```

## Tamanho, Complexidade e Risco
| Dimensão    | Avaliação | Justificativa |
|-------------|-----------|---------------|
| Tamanho     | Baixo/Médio | 3 endpoints leves (dados já persistidos) |
| Complexidade| Baixa     | Leitura de dados + lógica de streak simples |
| Risco       | Baixo     | Endpoints de leitura; sem operações de escrita complexas |

## Plano de Verificação
```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
# Testar cálculo de streak: simular dias consecutivos e dias de pausa
# Verificar que dados de progresso batem com conclusões de lição
```
