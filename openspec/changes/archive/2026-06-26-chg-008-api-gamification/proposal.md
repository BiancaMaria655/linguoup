# CHG-008 — API: Gamificação (Gamification Domain)

## Versão do Roadmap
**V1 — MVP**

## Descrição
Implementação do domínio de gamificação no backend NestJS: XP acumulado, histórico de XP, conquistas disponíveis, conquistas desbloqueadas pelo usuário e lógica de desbloqueio automático de conquistas após conclusão de atividades.

## Contexto
Dependências: CHG-006 (lições — fonte de XP), CHG-007 (streak — fonte de conquistas de consistência). As conquistas são desbloqueadas automaticamente via eventos disparados pela conclusão de lições. No MVP, o desbloqueio é síncrono (chamado dentro da transação de conclusão de lição ou logo após).

## Escopo

### O que está incluído

**Endpoints protegidos:**
- `GET /api/v1/xp` — XP total e histórico de ganhos (quando ganhou, quanto, por qual atividade)
- `GET /api/v1/achievements` — todas as conquistas disponíveis na plataforma
- `GET /api/v1/achievements/me` — conquistas desbloqueadas pelo usuário (com data de desbloqueio)

**Lógica de desbloqueio automático (via `AchievementUnlockService`):**
- Chamado após cada conclusão de lição
- Avalia critérios: primeira lição, 7 dias consecutivos de streak, 100 XP, 10 lições completadas
- Desbloqueia conquista e registra no banco (idempotente: não duplica se já desbloqueada)
- Retorna lista de novas conquistas desbloqueadas para exibição no frontend

**Dados iniciais (seed):**
- 10 conquistas pré-definidas: Primeira Lição, Sequência de 3 dias, Sequência de 7 dias, 100 XP, 500 XP, 10 lições, 25 lições, Iniciante, Intermediário, Avançado

**Testes:**
- Unitários: `AchievementUnlockService` (critérios de desbloqueio, idempotência)
- Integração: completar lição → verificar novas conquistas retornadas
- E2E: jornada "completar primeira lição → ver conquista desbloqueada"

### Non-goals
- Rankings e leaderboards entre usuários (V3)
- Conquistas sociais (V3)
- Sistema de ligas ou torneios (V3)
- XP como moeda virtual para comprar conteúdo

## Endpoints OpenAPI

```yaml
GET /api/v1/xp:
  auth: Bearer
  response:
    data:
      total: int
      history: [{ xpEarned, source, earnedAt }]

GET /api/v1/achievements:
  auth: Bearer
  response:
    data: [{ id, name, description, iconUrl, xpReward, criteria }]

GET /api/v1/achievements/me:
  auth: Bearer
  response:
    data: [{ achievement: Achievement, unlockedAt }]
```

**Resposta enriquecida de `POST /api/v1/lessons/{id}/complete` (CHG-006, atualizada):**
```yaml
response:
  data:
    xpEarned: int
    newTotalXP: int
    streakUpdated: bool
    streakDays: int
    newAchievements: [{ id, name, iconUrl }]   # ← novo campo
```

## Tamanho, Complexidade e Risco
| Dimensão    | Avaliação | Justificativa |
|-------------|-----------|---------------|
| Tamanho     | Médio     | 3 endpoints + lógica de desbloqueio automático |
| Complexidade| Baixa/Média | Critérios de conquistas simples; desbloqueio idempotente |
| Risco       | Baixo     | Operações de leitura predominantes; desbloqueio é append-only |

## Plano de Verificação
```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
# Testar desbloqueio automático ao completar primeira lição
# Verificar idempotência: completar mesma lição 2x não duplica conquista
# Verificar XP history ordenado cronologicamente
```
