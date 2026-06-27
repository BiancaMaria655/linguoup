# Capability: get-initial-plan

## Purpose

Retorna o plano inicial de aprendizado calculado dinamicamente a partir das preferências de onboarding do usuário via `GET /api/v1/users/me/onboarding/plan`. Requer onboarding completo.

## Requirements

### Requirement: Usuário autenticado pode obter seu plano inicial de aprendizado
O sistema SHALL retornar o plano inicial de aprendizado gerado a partir das preferências de onboarding via `GET /api/v1/users/me/onboarding/plan`.

O plano MUST ser calculado dinamicamente pela `UserDomainService` com base em `dailyGoalMinutes`. Se o onboarding não tiver sido concluído, o sistema MUST retornar erro 422.

**Regra de negócio (UserDomainService):**
```
dailyGoalMinutes ≤ 10  → dailyLessons = 1, intensity = "BASIC"
dailyGoalMinutes 11–20 → dailyLessons = 2, intensity = "INTERMEDIATE"
dailyGoalMinutes > 20  → dailyLessons = 3, intensity = "INTENSIVE"
weeklyGoal = dailyLessons × 5
```

**Contrato OpenAPI:**
```
GET /api/v1/users/me/onboarding/plan
Authorization: Bearer <token>

Response 200:
{
  "data": {
    "dailyLessons": "number",
    "weeklyGoal": "number",
    "intensity": "BASIC | INTERMEDIATE | INTENSIVE",
    "recommendedLevel": "BEGINNER | INTERMEDIATE | ADVANCED",
    "targetLanguage": "string",
    "message": "string (mensagem motivacional)"
  }
}

Response 401: { "error": { "code": "UNAUTHORIZED", "message": "..." } }
Response 422: { "error": { "code": "ONBOARDING_INCOMPLETE", "message": "Complete o onboarding antes de acessar o plano" } }
```

**RBAC:** Requer role `USER`.
**tenant_id:** Validado via JWT. Plano calculado exclusivamente a partir dos dados do próprio usuário.

#### Scenario: Plano retornado com sucesso após onboarding completo
- **WHEN** usuário com `onboardingCompleted: true` e `dailyGoalMinutes: 15` envia `GET /api/v1/users/me/onboarding/plan`
- **THEN** sistema retorna status 200 com `dailyLessons: 2`, `weeklyGoal: 10`, `intensity: "INTERMEDIATE"`

#### Scenario: Plano básico para meta de 10 minutos ou menos
- **WHEN** usuário com `dailyGoalMinutes: 10` acessa o plano
- **THEN** sistema retorna `dailyLessons: 1`, `weeklyGoal: 5`, `intensity: "BASIC"`

#### Scenario: Plano intensivo para meta acima de 20 minutos
- **WHEN** usuário com `dailyGoalMinutes: 30` acessa o plano
- **THEN** sistema retorna `dailyLessons: 3`, `weeklyGoal: 15`, `intensity: "INTENSIVE"`

#### Scenario: Erro 422 para usuário sem onboarding
- **WHEN** usuário sem `UserPreferences` (ou `onboardingCompleted: false`) acessa `GET /api/v1/users/me/onboarding/plan`
- **THEN** sistema retorna status 422 com `{ "error": { "code": "ONBOARDING_INCOMPLETE" } }`

#### Scenario: Requisição sem autenticação rejeitada
- **WHEN** requisição chega sem header `Authorization` válido
- **THEN** sistema retorna status 401
