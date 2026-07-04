# API Admin Capability Spec

## Purpose

Gerencia as operações administrativas de lições, conquistas e visualização de métricas da plataforma LinguoUp. Todos os endpoints exigem autenticação JWT, isolamento por `tenant_id` (quando aplicável) e RBAC mínimo `ADMIN`.

---

## Requirements

### Requirement: Admin can retrieve lessons catalog
O sistema SHALL retornar uma listagem de todas as lições (incluindo ativas e inativas) com filtro opcional por `level` para o tenant do administrador autenticado. O resultado é servido diretamente do banco de dados (sem cache Redis). O sistema valida `tenant_id` implícito via JWT e exige RBAC mínimo `ADMIN`.

**Endpoint**: `GET /api/v1/admin/lessons`
**RBAC**: `ADMIN` ou `SUPER_ADMIN`
**Request**: `?level=<string>`
**OpenAPI Impactado**: `GET /api/v1/admin/lessons`
**tenant_id validation**: Apenas lições cujo `tenant_id` seja idêntico ao `tenant_id` do JWT serão retornadas.
**Redis Cache Impact**: Nenhum (não cacheado).
**Prisma Impact**: Query de leitura simples utilizando `findMany`.

**Response (200)**:
```json
{
  "data": [
    {
      "id": "uuid-1",
      "title": "Introdução ao Verb to Be",
      "topic": "Gramática",
      "level": "beginner",
      "durationMinutes": 10,
      "isActive": true
    }
  ],
  "metadata": { "total": 1 }
}
```

**Response (401)**:
```json
{
  "error": { "code": "UNAUTHORIZED", "message": "Token inválido ou ausente" }
}
```

**Response (403)**:
```json
{
  "error": { "code": "FORBIDDEN", "message": "Insufficient permissions" }
}
```

#### Scenario: Admin lists all lessons successfully
- **WHEN** um usuário com role `ADMIN` faz a requisição `GET /api/v1/admin/lessons`
- **THEN** o sistema retorna HTTP 200 com a lista de todas as lições do respectivo tenant, contendo o campo `isActive`

#### Scenario: Student is forbidden from admin catalog
- **WHEN** um usuário com role `USER` faz a requisição `GET /api/v1/admin/lessons`
- **THEN** o sistema retorna HTTP 403 com `error.code = FORBIDDEN`

---

### Requirement: Admin can create a lesson
O sistema SHALL criar uma nova lição associada ao `tenant_id` do administrador autenticado. A lição será criada por padrão com `isActive = true`. O sistema invalida de forma síncrona o cache de catálogo dos alunos (`lessons:catalog:*`). Exige RBAC mínimo `ADMIN`.

**Endpoint**: `POST /api/v1/admin/lessons`
**RBAC**: `ADMIN` ou `SUPER_ADMIN`
**OpenAPI Impactado**: `POST /api/v1/admin/lessons`
**tenant_id validation**: O `tenant_id` gravado na nova lição SHALL ser extraído diretamente do JWT do administrador autenticado.
**Redis Cache Impact**: Invalidação imediata (deleção) de todas as chaves que combinem com a expressão `lessons:catalog:*`.
**Prisma Impact**: Gravação atômica no banco usando `prisma.lesson.create`.

**Request**:
```json
{
  "title": "Saudações Iniciais",
  "topic": "Vocabulário",
  "level": "beginner",
  "durationMinutes": 5,
  "description": "Aprenda a dizer olá e tchau."
}
```

**Response (201)**:
```json
{
  "data": {
    "id": "uuid-2",
    "title": "Saudações Iniciais",
    "topic": "Vocabulário",
    "level": "beginner",
    "durationMinutes": 5,
    "isActive": true
  }
}
```

#### Scenario: Admin creates a lesson successfully
- **WHEN** o administrador envia um payload de lição válido para `POST /api/v1/admin/lessons`
- **THEN** o sistema persiste a lição com `isActive = true`, limpa as chaves de cache `lessons:catalog:*` do Redis e retorna HTTP 201

#### Scenario: Input validation failure on creation
- **WHEN** o administrador envia um payload sem o campo `title`
- **THEN** o sistema rejeita a requisição e retorna HTTP 400 com erro de validação

---

### Requirement: Admin can edit a lesson
O sistema SHALL atualizar os dados de uma lição existente pertencente ao mesmo `tenant_id` do administrador autenticado. O sistema invalida o cache do catálogo de lições dos alunos (`lessons:catalog:*`). Exige RBAC mínimo `ADMIN`.

**Endpoint**: `PATCH /api/v1/admin/lessons/{id}`
**RBAC**: `ADMIN` ou `SUPER_ADMIN`
**OpenAPI Impactado**: `PATCH /api/v1/admin/lessons/{id}`
**tenant_id validation**: O sistema valida que a lição a ser editada possui o mesmo `tenant_id` do JWT antes de aplicar a alteração.
**Redis Cache Impact**: Invalidação imediata (deleção) de todas as chaves que combinem com a expressão `lessons:catalog:*`.
**Prisma Impact**: Gravação atômica no banco usando `prisma.lesson.update`.

**Request**:
```json
{
  "title": "Saudações e Apresentações",
  "durationMinutes": 7
}
```

**Response (200)**:
```json
{
  "data": {
    "id": "uuid-2",
    "title": "Saudações e Apresentações",
    "topic": "Vocabulário",
    "level": "beginner",
    "durationMinutes": 7,
    "isActive": true
  }
}
```

#### Scenario: Admin edits a lesson successfully
- **WHEN** o administrador envia campos válidos para `PATCH /api/v1/admin/lessons/{id}` de uma lição do seu tenant
- **THEN** o sistema atualiza a lição, remove as chaves `lessons:catalog:*` do Redis e retorna HTTP 200

#### Scenario: Admin tries to edit a lesson from another tenant
- **WHEN** o administrador tenta editar uma lição cuja propriedade `tenant_id` não coincide com seu JWT
- **THEN** o sistema retorna HTTP 404 com `error.code = NOT_FOUND`

---

### Requirement: Admin can deactivate a lesson (Soft Delete)
O sistema SHALL desativar uma lição pertencente ao mesmo `tenant_id` definindo `isActive = false`. Não são deletados registros do banco para preservar referências de histórico. O sistema invalida o cache do catálogo de lições dos alunos (`lessons:catalog:*`). Exige RBAC mínimo `ADMIN`.

**Endpoint**: `DELETE /api/v1/admin/lessons/{id}`
**RBAC**: `ADMIN` ou `SUPER_ADMIN`
**OpenAPI Impactado**: `DELETE /api/v1/admin/lessons/{id}`
**tenant_id validation**: Valida que a lição a ser desativada pertence ao mesmo `tenant_id` do JWT.
**Redis Cache Impact**: Invalidação imediata (deleção) de todas as chaves que combinem com `lessons:catalog:*`.
**Prisma Impact**: Atualização no banco usando `prisma.lesson.update` definindo `isActive = false`.

**Response (200)**:
```json
{
  "data": {
    "id": "uuid-2",
    "isActive": false
  }
}
```

#### Scenario: Admin soft deletes a lesson successfully
- **WHEN** o administrador executa `DELETE /api/v1/admin/lessons/{id}`
- **THEN** o sistema define `isActive = false` no banco, limpa cache e retorna HTTP 200

#### Scenario: Deactivation of non-existent lesson
- **WHEN** o administrador executa a deleção para um UUID inexistente
- **THEN** o sistema retorna HTTP 404 com `error.code = NOT_FOUND`

---

### Requirement: Admin can manage achievements
O sistema SHALL permitir que administradores criem e atualizem conquistas globais (conquistas não possuem `tenant_id`, são da plataforma inteira). O sistema invalida de forma síncrona o cache de conquistas dos alunos (`achievements:catalog`). Exige RBAC mínimo `ADMIN`.

**Endpoints**:
* `POST /api/v1/admin/achievements`
* `PATCH /api/v1/admin/achievements/{id}`
**RBAC**: `ADMIN` ou `SUPER_ADMIN`
**OpenAPI Impactado**: `POST /api/v1/admin/achievements`, `PATCH /api/v1/admin/achievements/{id}`
**tenant_id validation**: Conquistas são globais (não têm `tenant_id`). Qualquer admin autenticado de qualquer tenant pode gerenciá-las.
**Redis Cache Impact**: Deleção da chave `achievements:catalog` do Redis.
**Prisma Impact**: Criação ou atualização usando `prisma.achievement.create` ou `prisma.achievement.update`.

**Request (Criação)**:
```json
{
  "name": "Super Estudante",
  "description": "Estude por 10 dias seguidos",
  "iconUrl": "/icons/achievements/super-student.svg",
  "xpReward": 100,
  "criteria": { "type": "streak_days", "threshold": 10 }
}
```

**Response (200/201)**:
```json
{
  "data": {
    "id": "uuid-ach",
    "name": "Super Estudante",
    "description": "Estude por 10 dias seguidos",
    "iconUrl": "/icons/achievements/super-student.svg",
    "xpReward": 100,
    "criteria": { "type": "streak_days", "threshold": 10 }
  }
}
```

#### Scenario: Admin creates an achievement successfully
- **WHEN** o administrador submete uma nova conquista para `POST /api/v1/admin/achievements`
- **THEN** o sistema cria o registro, invalida a chave `achievements:catalog` do Redis e retorna HTTP 201

#### Scenario: Admin edits an achievement successfully
- **WHEN** o administrador submete alterações para `PATCH /api/v1/admin/achievements/{id}`
- **THEN** o sistema atualiza os campos, limpa a chave `achievements:catalog` e retorna HTTP 200

---

### Requirement: Admin can retrieve dashboard metrics
O sistema SHALL compilar e retornar métricas gerais e diárias (total de usuários cadastrados no tenant, usuários ativos hoje no tenant, total de lições no catálogo do tenant, total de conclusões de lições efetuadas hoje pelo tenant e total de conquistas cadastradas). Exige RBAC mínimo `ADMIN`.

**Endpoint**: `GET /api/v1/admin/metrics`
**RBAC**: `ADMIN` ou `SUPER_ADMIN`
**OpenAPI Impactado**: `GET /api/v1/admin/metrics`
**tenant_id validation**: Métricas consolidadas retornam dados exclusivos baseados no `tenant_id` do JWT.
**Redis Cache Impact**: Nenhum (métricas em tempo real).
**Prisma Impact**: Múltiplas contagens agregadas em tabelas usando `count` com filtro de data para o dia corrente.

**Response (200)**:
```json
{
  "data": {
    "totalUsers": 1240,
    "activeToday": 89,
    "totalLessons": 45,
    "lessonsCompletedToday": 142,
    "totalAchievements": 10
  }
}
```

#### Scenario: Admin views dashboard metrics
- **WHEN** administrador faz a requisição `GET /api/v1/admin/metrics`
- **THEN** o sistema calcula as estatísticas em tempo real agregadas pelo `tenant_id` e retorna HTTP 200 com os dados consolidados
