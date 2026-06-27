# Capability: get-user-profile

## Purpose

Permite que o usuário autenticado consulte seu perfil completo, incluindo dados pessoais e preferências de onboarding, via `GET /api/v1/users/me`.

## Requirements

### Requirement: Usuário autenticado pode consultar seu perfil completo
O sistema SHALL retornar o perfil completo do usuário autenticado quando uma requisição autenticada for enviada para `GET /api/v1/users/me`.

O endpoint MUST validar o JWT, extrair `userId` e `tenant_id` do payload, e retornar somente os dados do próprio usuário.

**Contrato OpenAPI:**
```
GET /api/v1/users/me
Authorization: Bearer <token>

Response 200:
{
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "USER | ADMIN | SUPER_ADMIN",
    "level": "BEGINNER | INTERMEDIATE | ADVANCED",
    "preferences": {
      "learningGoal": "string | null",
      "targetLanguage": "string | null",
      "dailyGoalMinutes": "number | null",
      "preferredStudyTime": "string | null",
      "onboardingCompleted": "boolean"
    } | null,
    "createdAt": "ISO8601"
  }
}

Response 401: { "error": { "code": "UNAUTHORIZED", "message": "Token inválido ou expirado" } }
```

**RBAC:** Requer role `USER` (mínimo). `ADMIN` e `SUPER_ADMIN` também podem usar este endpoint para seus próprios perfis.
**tenant_id:** Validado via JWT. O usuário MUST retornar somente seus próprios dados.

#### Scenario: Perfil retornado com sucesso
- **WHEN** usuário autenticado envia `GET /api/v1/users/me` com JWT válido
- **THEN** sistema retorna status 200 com os dados do perfil, incluindo `preferences` (ou `null` se onboarding não concluído)

#### Scenario: Requisição sem autenticação rejeitada
- **WHEN** requisição chega sem header `Authorization` ou com token inválido
- **THEN** sistema retorna status 401 com `{ "error": { "code": "UNAUTHORIZED" } }`

#### Scenario: Preferências nulas para usuário sem onboarding
- **WHEN** usuário autenticado nunca realizou onboarding envia `GET /api/v1/users/me`
- **THEN** sistema retorna 200 com `preferences: null`
