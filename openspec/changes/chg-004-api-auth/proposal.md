# CHG-004 — API: Autenticação (Auth Domain)

## Versão do Roadmap
**V1 — MVP**

## Descrição
Implementação do domínio de autenticação no backend NestJS, seguindo Clean Architecture. Cobre registro por e-mail/senha, login, refresh de token e logout. Integração com Auth0 como provedor de identidade (OAuth 2.1 + OIDC + JWT RS256 + Refresh Token Rotativo).

## Contexto
Dependências: CHG-001, CHG-003. Este é o primeiro domínio de negócio do backend. Todos os outros endpoints protegidos dependem da autenticação funcionar corretamente. Segue o fluxo: `AuthController → AuthUseCase → AuthDomainService → UserRepository → Prisma`.

## Escopo

### O que está incluído

**Endpoints públicos:**
- `POST /api/v1/auth/register` — criação de conta (email + senha, hash Argon2id)
- `POST /api/v1/auth/login` — autenticação por email/senha, retorna `accessToken` (15min) + `refreshToken` (30 dias, HttpOnly)
- `POST /api/v1/auth/refresh` — renovação de access token via refresh token rotativo
- `POST /api/v1/auth/logout` — invalidação do refresh token (blacklist no Redis)

**Camadas:**
- `AuthController` — validação de entrada (class-validator DTOs), rate limiting (10 req/min por IP)
- `RegisterUserUseCase`, `LoginUserUseCase`, `RefreshTokenUseCase`, `LogoutUseCase`
- `AuthDomainService` — lógica de senha (Argon2id), geração de JWT
- `UserRepository` — acesso ao Prisma

**Segurança:**
- Rate limiting: 10 req/min por IP nos endpoints de auth
- JWT Guard para rotas protegidas (reusado por outros módulos)
- Validação de `tenant_id` em todo Use Case
- Blacklist de refresh tokens no Redis

**Testes:**
- Unitários: `RegisterUserUseCase`, `LoginUserUseCase` (mocks de repositório)
- Integração: fluxo completo de register → login → refresh → logout
- E2E: via supertest no NestJS

**Observabilidade:**
- Logs estruturados com `trace_id`, `user_id`, `tenant_id`
- Métricas: latência dos endpoints de auth
- Sentry: captura de exceções (sem tokens ou senhas em logs)

### Non-goals
- Login social (Google, Apple) — CHG-005
- MFA — fora do MVP para usuários `USER`; obrigatório para `ADMIN`/`SUPER_ADMIN` em versão futura
- Interface de usuário (CHG-008)
- Reset de senha por e-mail

## Endpoints OpenAPI

```yaml
POST /api/v1/auth/register:
  request: { email, name, password }
  response: { data: { userId, email, name } }

POST /api/v1/auth/login:
  request: { email, password }
  response: { data: { accessToken, expiresIn } }
  set-cookie: refreshToken (HttpOnly)

POST /api/v1/auth/refresh:
  cookie: refreshToken
  response: { data: { accessToken, expiresIn } }

POST /api/v1/auth/logout:
  header: Authorization Bearer
  response: { data: { message: "Logged out" } }
```

## Tamanho, Complexidade e Risco
| Dimensão    | Avaliação | Justificativa |
|-------------|-----------|---------------|
| Tamanho     | Médio     | 4 endpoints + camadas Clean Architecture |
| Complexidade| Média     | JWT, Argon2id, Redis blacklist, rate limiting |
| Risco       | Médio     | Autenticação é fluxo crítico; testes de integração obrigatórios |

## Plano de Verificação
```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
# Testar manualmente: register → login → refresh → logout
# Verificar que token inválido retorna 401
# Verificar rate limiting com 11 req/min
```
