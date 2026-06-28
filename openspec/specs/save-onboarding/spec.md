# Capability: save-onboarding

## Purpose

Permite que o usuário autenticado persista suas preferências de onboarding via `POST /api/v1/users/me/onboarding`. A operação é idempotente (upsert) e marca `onboardingCompleted` como `true` ao finalizar com sucesso.

## Requirements

### Requirement: Usuário autenticado pode salvar preferências de onboarding
O sistema SHALL persistir as preferências de onboarding do usuário autenticado via `POST /api/v1/users/me/onboarding`.

A operação MUST ser idempotente — chamadas repetidas com os mesmos dados não devem gerar erro (upsert). O campo `onboardingCompleted` MUST ser marcado como `true` após a persistência bem-sucedida.

**Contrato OpenAPI:**
```
POST /api/v1/users/me/onboarding
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "learningGoal": "string (required, ex: 'TRAVEL' | 'CAREER' | 'CULTURE' | 'EXAM')",
  "targetLanguage": "string (required, ex: 'en-US', 'es-ES', 'fr-FR')",
  "dailyGoalMinutes": "number (required, min 5, max 120)",
  "preferredStudyTime": "string | null (optional, ex: 'MORNING' | 'AFTERNOON' | 'EVENING')"
}

Response 200:
{
  "data": {
    "onboardingCompleted": true
  }
}

Response 400: { "error": { "code": "VALIDATION_ERROR", "message": "..." } }
Response 401: { "error": { "code": "UNAUTHORIZED", "message": "..." } }
```

**RBAC:** Requer role `USER`.
**tenant_id:** Validado via JWT. Preferências MUST ser associadas ao `userId` do JWT.
**Validação:**
- `learningGoal`: obrigatório; valor deve ser um dos valores permitidos do enum.
- `targetLanguage`: obrigatório; código BCP-47 (mínimo 2 chars, máximo 10).
- `dailyGoalMinutes`: obrigatório; inteiro; mínimo 5; máximo 120.
- `preferredStudyTime`: opcional; valor deve ser um dos valores permitidos do enum ou `null`.

**Transação Prisma:** A operação de upsert em `UserPreferences` MUST ser executada em transação única.

#### Scenario: Preferências salvas com sucesso (primeira vez)
- **WHEN** usuário autenticado envia `POST /api/v1/users/me/onboarding` com todos os campos obrigatórios válidos e JWT válido
- **THEN** sistema persiste as preferências com `onboardingCompleted: true`, retorna status 200 com `{ "data": { "onboardingCompleted": true } }`

#### Scenario: Onboarding atualizado (chamada repetida — idempotência)
- **WHEN** usuário já com onboarding completo envia `POST /api/v1/users/me/onboarding` com dados diferentes
- **THEN** sistema atualiza as preferências existentes via upsert e retorna status 200

#### Scenario: Campos obrigatórios ausentes rejeitados
- **WHEN** usuário envia `POST /api/v1/users/me/onboarding` sem `learningGoal`
- **THEN** sistema retorna status 400 com `{ "error": { "code": "VALIDATION_ERROR", "message": "learningGoal is required" } }`

#### Scenario: `dailyGoalMinutes` fora do intervalo rejeitado
- **WHEN** usuário envia `dailyGoalMinutes: 200` (acima do máximo)
- **THEN** sistema retorna status 400 com `{ "error": { "code": "VALIDATION_ERROR" } }`

#### Scenario: Logs estruturados emitidos
- **WHEN** onboarding é salvo com sucesso
- **THEN** sistema emite log estruturado com campos `user_id`, `tenant_id`, `trace_id` e `level: "info"`
