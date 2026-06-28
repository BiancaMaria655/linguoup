## Context

CHG-005 implementa o **domínio de usuários** no backend NestJS — a segunda camada do MVP após a autenticação (CHG-004). Os endpoints de usuário operam exclusivamente sobre dados do próprio usuário autenticado (via JWT), sem exposição de dados entre tenants.

**Estado atual:** O módulo `auth` (CHG-004) está implementado e fornece `JwtAuthGuard`, `CurrentUser` decorator e o repositório de usuários para autenticação. Não existe ainda nenhum módulo `users` — este CHG cria o domínio inteiro do zero.

**Dependências:**
- `JwtAuthGuard` do módulo `auth` — protege todos os endpoints
- `UserRepository` do módulo `auth` — reutilizado para leitura/atualização do perfil
- Schema Prisma: entidades `User` e `UserPreferences` já existentes (ou a serem adicionadas)

**Stakeholders:** Equipe frontend (consome `GET /me`, `POST /onboarding`), sistema de trilhas (consome plano inicial).

---

## Goals / Non-Goals

**Goals:**
- Expor perfil do usuário autenticado via `GET /api/v1/users/me`
- Permitir atualização de nome via `PATCH /api/v1/users/me`
- Persistir preferências de onboarding via `POST /api/v1/users/me/onboarding`
- Gerar e retornar plano inicial de aprendizado via `GET /api/v1/users/me/onboarding/plan`
- Garantir isolamento por `userId` (do JWT) e `tenant_id` em toda operação
- Cobertura de testes: unitários (use cases) + integração (fluxo onboarding)
- Observabilidade: logs estruturados com `user_id`, `tenant_id`, `trace_id`

**Non-Goals:**
- Upload de foto de perfil (requer S3 — CHG futura)
- Avaliação diagnóstica de nível de idioma (CHG-006)
- Geração de trilhas e lições (CHG-007)
- Admin endpoints (`ADMIN`/`SUPER_ADMIN`) para gestão de usuários
- Login social (Google, Apple) — responsabilidade do módulo `auth`

---

## Decisions

### 1. Módulo `users` independente, não acoplado a `auth`

**Decisão:** Criar `UsersModule` separado do `AuthModule`, importando apenas `UserRepository` via provider compartilhado.

**Alternativas consideradas:**
- Adicionar os endpoints de usuário dentro do `AuthModule` → rejeitado: violaria SRP e tornaria o módulo `auth` muito grande.
- Criar um `SharedModule` com `UserRepository` → aceitável, mas prematuro para MVP; preferiu-se importação direta.

**Rationale:** Separação de responsabilidades. `auth` cuida de identidade; `users` cuida de perfil e preferências.

---

### 2. `UserRepository` reutilizado do módulo `auth`

**Decisão:** Reutilizar o `UserRepository` já implementado em `auth/repositories/`, exportando-o via `AuthModule` ou extraindo para `DatabaseModule`.

**Alternativas consideradas:**
- Criar `UsersRepository` separado → duplicaria código de acesso a Prisma para `User`.
- Mover para `DatabaseModule` → correto a longo prazo, mas fora do escopo deste CHG.

**Rationale:** Menor mudança. O repositório já abstrai `User` + `UserPreferences`; basta exportá-lo.

---

### 3. Lógica de plano inicial em `UserDomainService`

**Decisão:** A geração do plano inicial (nível + disponibilidade diária → quantidade de lições/semana) fica em `UserDomainService`, não no use case.

**Regra de negócio simples:**
```
dailyGoalMinutes ≤ 10  → 1 lição/dia  (básico)
dailyGoalMinutes 11-20 → 2 lições/dia (intermediário)
dailyGoalMinutes > 20  → 3 lições/dia (intensivo)
weeklyGoal = dailyLessons × 5 (dias úteis)
```

**Rationale:** Regra de negócio reside exclusivamente na camada Domain/Application (Clean Architecture). O use case orquestra, o domain service calcula.

---

### 4. `tenant_id` derivado do JWT, nunca do body

**Decisão:** O `tenant_id` é extraído do payload JWT pelo `CurrentUser` decorator. Nenhum endpoint aceita `tenant_id` no body.

**Rationale:** Segurança — impede que um usuário forje dados de outro tenant. Alinhado com o padrão estabelecido em `auth`.

---

### 5. Schema Prisma: adição de `UserPreferences`

**Decisão:** Se `UserPreferences` não existir no schema, adicioná-la neste CHG com os campos necessários para onboarding. Migration deve ser aprovada antes de rodar.

**Campos:**
```prisma
model UserPreferences {
  id                 String   @id @default(cuid())
  userId             String   @unique
  learningGoal       String
  targetLanguage     String
  dailyGoalMinutes   Int
  preferredStudyTime String?
  onboardingCompleted Boolean @default(false)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  user               User     @relation(fields: [userId], references: [id])
}
```

---

## Risks / Trade-offs

| Risco | Mitigação |
|-------|-----------|
| `UserPreferences` não existe no schema Prisma | Criar migration e obter aprovação antes da implementação |
| `UserRepository` exportado do `AuthModule` pode criar acoplamento | Aceitável no MVP; planejar extração para `DatabaseModule` em V2 |
| Lógica de plano inicial muito simplista para usuários reais | Explicitamente Non-Goal no MVP; CHG-006 (avaliação de nível) refinará isso |
| Endpoints de onboarding chamados múltiplas vezes (idempotência) | `POST /onboarding` usa upsert no Prisma — seguro chamar múltiplas vezes |

---

## Migration Plan

1. **Verificar schema Prisma** — checar se `UserPreferences` existe; se não, criar migration (requer aprovação)
2. **Criar `UsersModule`** com estrutura Clean Architecture
3. **Implementar Use Cases** em ordem: `GetUserProfile` → `UpdateProfile` → `SaveOnboarding` → `GetInitialPlan`
4. **Registrar módulo** no `AppModule`
5. **Testes** unitários dos use cases + integração do fluxo completo
6. **Rollback:** Nenhum dado crítico é afetado; `UserPreferences` pode ser dropada sem impacto em `User`

---

## Open Questions

- `UserRepository` está exportado pelo `AuthModule`? Se não, qual a estratégia preferida: exportar via `AuthModule` ou mover para `DatabaseModule`?
- O campo `level` em `User` (`BEGINNER`/`INTERMEDIATE`/`ADVANCED`) já existe no schema? Ou é inferido das preferências?
