## MODIFIED Requirements

### Requirement: List Lessons Catalog
O sistema SHALL retornar um catálogo paginado de lições disponíveis e ativas (`isActive: true`) para o tenant do usuário autenticado. A listagem usa paginação cursor-based e suporta filtros por `level` e `theme`. O resultado é servido a partir do cache Redis (TTL 1h, Cache-aside). O sistema valida `tenant_id` implícito via JWT, exige RBAC mínimo `USER`, e retorna `{ data: Lesson[], metadata: { cursor, total } }`.

**Endpoint**: `GET /api/v1/lessons`
**RBAC**: `USER` ou superior
**Request**: `?level=<string>&theme=<string>&cursor=<uuid>&limit=<int>`
**Response (200)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "level": "string",
      "theme": "string",
      "durationMinutes": 10
    }
  ],
  "metadata": { "cursor": "uuid|null", "total": 42 }
}
```
**Response (401)**: `{ "error": { "code": "UNAUTHORIZED", "message": "Token inválido ou ausente" } }`

#### Scenario: List all lessons without filters
- **WHEN** usuário autenticado faz `GET /api/v1/lessons` sem query params
- **THEN** sistema retorna lista de lições do tenant com `metadata.cursor` para próxima página

#### Scenario: Filter lessons by level and theme
- **WHEN** usuário faz `GET /api/v1/lessons?level=A1&theme=greetings`
- **THEN** sistema retorna apenas lições com `level=A1` e `theme=greetings` do tenant

#### Scenario: Paginate using cursor
- **WHEN** usuário faz `GET /api/v1/lessons?cursor=<uuid>&limit=10`
- **THEN** sistema retorna as próximas 10 lições a partir do cursor fornecido

#### Scenario: Result served from Redis cache on second request
- **WHEN** a mesma query é feita duas vezes consecutivas
- **THEN** a segunda requisição não acessa o banco de dados (hit de cache Redis)

#### Scenario: Unauthenticated request
- **WHEN** usuário faz requisição sem Bearer token
- **THEN** sistema retorna 401 com `error.code = UNAUTHORIZED`

#### Scenario: Inactive lessons are excluded from catalog
- **WHEN** uma lição possui `isActive: false` no banco de dados e o usuário faz a listagem
- **THEN** a lição inativa não é incluída na resposta do catálogo

---

### Requirement: Get Lesson Detail
O sistema SHALL retornar o detalhe completo de uma lição ativa (`isActive: true`, incluindo `content` com exercícios) para o tenant do usuário autenticado. Valida que a lição pertence ao mesmo `tenant_id` do usuário e que está ativa. RBAC mínimo: `USER`.

**Endpoint**: `GET /api/v1/lessons/{id}`
**RBAC**: `USER` ou superior
**Response (200)**:
```json
{
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "level": "string",
    "theme": "string",
    "durationMinutes": 10,
    "content": { "exercises": [...] }
  }
}
```
**Response (404)**: `{ "error": { "code": "NOT_FOUND", "message": "Lição não encontrada" } }`
**Response (401)**: `{ "error": { "code": "UNAUTHORIZED", "message": "Token inválido ou ausente" } }`

#### Scenario: Get existing lesson detail
- **WHEN** usuário autenticado faz `GET /api/v1/lessons/{id}` com ID válido e lição ativa
- **THEN** sistema retorna lição com `content` completo incluindo exercícios

#### Scenario: Lesson not found or wrong tenant
- **WHEN** usuário faz `GET /api/v1/lessons/{id}` com ID inexistente ou de outro tenant
- **THEN** sistema retorna 404 com `error.code = NOT_FOUND`

#### Scenario: Attempt to get inactive lesson detail
- **WHEN** usuário faz `GET /api/v1/lessons/{id}` com ID de uma lição que possui `isActive: false`
- **THEN** sistema retorna 404 com `error.code = NOT_FOUND`
