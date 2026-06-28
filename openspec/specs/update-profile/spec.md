# Capability: update-profile

## Purpose

Permite que o usuário autenticado atualize campos editáveis de seu perfil (ex.: nome) via `PATCH /api/v1/users/me`. Suporta patch parcial — campos não enviados são preservados.

## Requirements

### Requirement: Usuário autenticado pode atualizar seu próprio perfil
O sistema SHALL permitir que o usuário autenticado atualize campos de perfil editáveis (nome) via `PATCH /api/v1/users/me`.

O endpoint MUST validar o JWT, extrair `userId` do payload, e aplicar a atualização somente ao registro do próprio usuário. Campos não enviados MUST ser preservados (patch parcial).

**Contrato OpenAPI:**
```
PATCH /api/v1/users/me
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "name"?: "string (min 2, max 100 chars)"
}

Response 200:
{
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "updatedAt": "ISO8601"
  }
}

Response 400: { "error": { "code": "VALIDATION_ERROR", "message": "..." } }
Response 401: { "error": { "code": "UNAUTHORIZED", "message": "..." } }
```

**RBAC:** Requer role `USER` (mínimo).
**tenant_id:** Validado via JWT. Atualização MUST afetar somente o registro do próprio usuário.
**Validação:**
- `name`: obrigatório quando enviado; mínimo 2 caracteres; máximo 100 caracteres.
- Campos não reconhecidos MUST ser ignorados (whitelist via class-validator).

#### Scenario: Nome atualizado com sucesso
- **WHEN** usuário autenticado envia `PATCH /api/v1/users/me` com `{ "name": "Maria Silva" }` e JWT válido
- **THEN** sistema persiste o novo nome, retorna status 200 com os dados atualizados incluindo `updatedAt`

#### Scenario: Requisição sem body ou campos inválidos rejeitada
- **WHEN** usuário envia `PATCH /api/v1/users/me` com `{ "name": "A" }` (nome com 1 caractere)
- **THEN** sistema retorna status 400 com `{ "error": { "code": "VALIDATION_ERROR", "message": "name must be at least 2 characters" } }`

#### Scenario: PATCH sem campos conhecidos não altera dados
- **WHEN** usuário envia `PATCH /api/v1/users/me` com body vazio `{}`
- **THEN** sistema retorna status 200 sem realizar alterações no banco

#### Scenario: Requisição sem autenticação rejeitada
- **WHEN** requisição chega sem header `Authorization` válido
- **THEN** sistema retorna status 401
