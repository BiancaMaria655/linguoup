# CHG-005 — API: Usuários & Onboarding (Users Domain)

## Versão do Roadmap
**V1 — MVP**

## Descrição
Implementação do domínio de usuários no backend NestJS: perfil do usuário autenticado, preferências de aprendizado, e lógica de onboarding (objetivo, idioma, disponibilidade diária). Estes dados alimentam a personalização do plano inicial.

## Contexto
Dependências: CHG-004 (auth). Os endpoints de usuário são protegidos por JWT Guard. O onboarding persiste `UserPreferences` no banco e determina o plano inicial de aprendizado. Fluxo: `UsersController → UpdateProfileUseCase → UserDomainService → UserRepository → Prisma`.

## Escopo

### O que está incluído

**Endpoints protegidos:**
- `GET /api/v1/users/me` — perfil completo do usuário autenticado (nome, email, nível, preferências)
- `PATCH /api/v1/users/me` — atualização de perfil (nome, foto)
- `POST /api/v1/users/me/onboarding` — salva preferências do onboarding (objetivo, idioma, disponibilidade diária, horário preferencial)
- `GET /api/v1/users/me/onboarding/plan` — retorna plano inicial gerado com base nas preferências

**Camadas:**
- `UsersController` — DTOs com validação, RBAC: `USER`
- `GetUserProfileUseCase`, `UpdateProfileUseCase`, `SaveOnboardingUseCase`, `GetInitialPlanUseCase`
- `UserDomainService` — geração de plano inicial (lógica simples: nível + disponibilidade → quantidade de lições diárias)
- `UserRepository` — acesso ao Prisma (`User`, `UserPreferences`)

**Validação:**
- `tenant_id` validado em todo Use Case
- Usuário só acessa e modifica seus próprios dados (`userId` do JWT)

**Testes:**
- Unitários: `SaveOnboardingUseCase`, `GetInitialPlanUseCase`
- Integração: fluxo completo de onboarding (login → salvar preferências → obter plano)

**Observabilidade:**
- Logs estruturados com `user_id`, `tenant_id`, `trace_id`

### Non-goals
- Login social (Google, Apple) integrado ao Auth0
- Upload de foto de perfil (S3 — CHG futura)
- Avaliação de nível (CHG-006)
- Trilhas e lições (CHG-007)

## Endpoints OpenAPI

```yaml
GET /api/v1/users/me:
  auth: Bearer
  response: { data: { id, name, email, role, preferences, level, createdAt } }

PATCH /api/v1/users/me:
  auth: Bearer
  request: { name? }
  response: { data: { id, name, email, updatedAt } }

POST /api/v1/users/me/onboarding:
  auth: Bearer
  request: { learningGoal, targetLanguage, dailyGoalMinutes, preferredStudyTime }
  response: { data: { onboardingCompleted: true } }

GET /api/v1/users/me/onboarding/plan:
  auth: Bearer
  response: { data: { dailyLessons, weeklyGoal, recommendedLevel, message } }
```

## Tamanho, Complexidade e Risco
| Dimensão    | Avaliação | Justificativa |
|-------------|-----------|---------------|
| Tamanho     | Médio     | 4 endpoints + geração de plano |
| Complexidade| Baixa     | Lógica de negócio simples; sem algoritmos complexos |
| Risco       | Baixo     | Dados de perfil; sem impacto em fluxos críticos |

## Plano de Verificação
```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
# Testar: login → GET /me → POST /onboarding → GET /plan
# Verificar que usuário não acessa dados de outro usuário (tenant isolation)
```
