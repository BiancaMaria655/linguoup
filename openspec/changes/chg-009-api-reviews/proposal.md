# CHG-009 — API: Revisões & Repetição Espaçada (Reviews Domain)

## Versão do Roadmap
**V1 — MVP** (algoritmo SM-2 embutido no backend)

## Descrição
Implementação do motor de repetição espaçada no backend NestJS, utilizando o algoritmo SM-2 (SuperMemo 2) embutido na camada `learning`. Expõe endpoints para obter itens recomendados para revisão e registrar resultados de revisão.

## Contexto
Dependências: CHG-006 (lições). O SM-2 calcula o próximo intervalo de revisão com base na qualidade da resposta do usuário (0–5). Os dados de revisão são persistidos na entidade `SpacedReviewItem`. No V2, este serviço será extraído para um serviço dedicado.

## Escopo

### O que está incluído

**Endpoints protegidos:**
- `GET /api/v1/reviews/recommended` — itens pendentes de revisão (ordenados por prioridade: `nextReviewAt` ≤ hoje)
- `POST /api/v1/reviews/complete` — registrar resultado de revisão e calcular próximo intervalo (SM-2)

**Algoritmo SM-2:**
```
Se qualidade >= 3:
  intervalo = max(1, intervalo_anterior * easeFactor)
  easeFactor = easeFactor + (0.1 - (5 - qualidade) * (0.08 + (5 - qualidade) * 0.02))
Senão:
  intervalo = 1
  easeFactor = max(1.3, easeFactor - 0.2)
nextReviewAt = hoje + intervalo (dias)
```

**Criação automática de `SpacedReviewItem`:**
- Ao concluir uma lição (CHG-006), o sistema cria `SpacedReviewItem` para cada item de vocabulário/gramática da lição com `nextReviewAt = hoje + 1 dia` e `easeFactor = 2.5`

**Testes:**
- Unitários: `SM2AlgorithmService` (cálculo de intervalos para qualidades 0–5)
- Unitários: `GetRecommendedReviewsUseCase` (filtragem por data)
- Integração: fluxo completo — completar lição → itens de revisão criados → revisar → próximo intervalo calculado

### Non-goals
- Interface de revisão (CHG-011)
- Extração para Recommendation Service dedicado (V2)
- Personalização avançada do algoritmo (V2)
- Revisão de conteúdo de conversação com IA (V3)

## Endpoints OpenAPI

```yaml
GET /api/v1/reviews/recommended:
  auth: Bearer
  query: { limit?: 20 }
  response:
    data: [{ id, lessonId, lessonTitle, itemContent, dueDate, priority }]
    metadata: { total, overdueCount }

POST /api/v1/reviews/complete:
  auth: Bearer
  request:
    reviewItemId: string
    quality: int  # 0-5 (SM-2 scale)
  response:
    data:
      nextReviewAt: date
      interval: int  # dias
      easeFactor: float
      xpEarned: int
```

## Tamanho, Complexidade e Risco
| Dimensão    | Avaliação | Justificativa |
|-------------|-----------|---------------|
| Tamanho     | Baixo/Médio | 2 endpoints + algoritmo SM-2 bem definido |
| Complexidade| Média     | SM-2 requer precisão matemática; lógica de agendamento |
| Risco       | Baixo     | Algoritmo bem documentado e testável; dados separados das lições |

## Plano de Verificação
```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
# Testar SM-2 com qualidade 0 → intervalo deve resetar para 1 dia
# Testar SM-2 com qualidade 5 → intervalo deve crescer progressivamente
# Verificar que GET /reviews/recommended retorna apenas itens com nextReviewAt ≤ hoje
```
