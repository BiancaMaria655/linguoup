# Arquitetura de Software

## Contexto Arquitetural

### Objetivo

Este documento define a arquitetura de software do produto **LinguoUp**, estabelecendo diretrizes técnicas, restrições arquiteturais e requisitos não funcionais para implementação por equipes humanas e agentes de inteligência artificial.

O LinguoUp é uma plataforma web responsiva de aprendizado de idiomas baseada em microaprendizagem. O objetivo do produto é transformar pequenos momentos do dia em oportunidades de estudo por meio de lições rápidas (3–5 min), personalização, gamificação e mecanismos inteligentes de formação de hábitos, suportando até 1 milhão de usuários ativos com alta disponibilidade e segurança.

### Escopo

A arquitetura contempla:

* **Frontend Web (Client/Admin)** — Aplicação Next.js responsiva, responsável por onboarding, lições, gamificação, dashboard, perfil, progresso e painel administrativo para gestão de conteúdo.
* **Backend** — API NestJS com domínios de auth, users, learning, progress, gamification e notifications.
* **Banco de Dados** — PostgreSQL como fonte de verdade transacional; Redis como cache de sessões, rankings e conteúdo frequente.
* **Storage** — AWS S3 para áudios, imagens, conteúdo multimídia e pacotes offline.
* **Infraestrutura** — AWS (EKS, RDS, S3, CloudFront), containerizada com Kubernetes, Blue-Green Deployment.
* **Segurança** — Auth0 (MVP), evoluindo para AWS Cognito; OAuth 2.1 / OIDC / RBAC.
* **Observabilidade** — OpenTelemetry + Prometheus + Grafana + Loki + Sentry.
* **Integrações Externas** — Provedores de identidade social (Google, Apple), AWS KMS, SonarQube, Dependabot, Trivy.
* **Motor de IA** — Motor de recomendação (V1–V2 embutido no backend) e Serviço de IA Conversacional (V3, serviço dedicado).

### Arquitetura de Referência

* **Estilo arquitetural:** Modular Monolith (MVP) com evolução planejada para Microservices orientados a domínio.
* **Comunicação:** HTTPS REST / JSON (cliente ↔ backend); REST interno (MVP), gRPC (evolução entre microsserviços).
* **Infraestrutura:** Cloud-native, containerizada na AWS com Kubernetes (EKS), Blue-Green Deployment e rollback automático.
* **Observabilidade:** OpenTelemetry + Prometheus + Grafana + Loki + Sentry.
* **Segurança:** OAuth 2.1 + OIDC + JWT + Refresh Token Rotation + RBAC (User / Admin / Super_Admin).

---

### Stack Tecnológica

#### Frontend Web (Next.js)

* Linguagem: TypeScript
* Framework: Next.js (App Router)
* Estilização: Tailwind CSS
* Gerenciamento de Estado (servidor): TanStack Query
* Gerenciamento de Estado (UI/global): Zustand
* Formulários locais: useState

#### Backend

* Linguagem: TypeScript
* Runtime: Node.js LTS
* Framework: NestJS
* ORM: Prisma ORM
* Banco de dados principal: PostgreSQL
* Cache: Redis

#### Banco de Dados

* SGBD: PostgreSQL
* Versão mínima: 15
* Cache: Redis 7+

#### Storage

* Provedor: AWS S3
* CDN: AWS CloudFront (distribuição de conteúdo estático e multimídia)

#### Observabilidade

* Instrumentação: OpenTelemetry (tracing distribuído, métricas, logs estruturados)
* Métricas: Prometheus + Grafana
* Logs: Loki
* Alertas e erros: Sentry

#### Identidade

* Provedor (MVP): Auth0
* Provedor (evolução): AWS Cognito
* Protocolos: OAuth 2.1 · OIDC · JWT Access Token · Refresh Token Rotativo

#### Desenvolvimento

* Gerenciador de pacotes: pnpm (monorepo)
* IDE recomendada: VS Code
* Ambiente local: Docker Compose
* Linting/Formatação: ESLint + Prettier (via `packages/config`)

#### DevOps

* CI/CD: GitHub Actions — fluxo: Build → Testes → SAST → Deploy Staging → Aprovação → Produção
* Infraestrutura como Código: Terraform
* Orquestração: Kubernetes (AWS EKS)
* Estratégia de deploy: Blue-Green com rollback automático
* DevSecOps: SonarQube (SAST), Trivy (container scanning), Dependabot (dependency scanning)

---

### Estrutura do Repositório

```text
.
├── apps/
│   ├── web/           # Next.js — portal do aluno e painel administrativo
│   └── api/           # NestJS — domínios: auth, users, learning, progress, gamification, notifications
├── packages/
│   ├── ui/            # Componentes compartilhados (design system)
│   ├── config/        # ESLint, TSConfig, Prettier compartilhados
│   └── database/      # Schema Prisma e migrations
├── docs/
│   ├── prd.md
│   ├── spec_tech.md
│   ├── spec_ui.md
│   ├── definicao_problema.md
│   ├── prompt_desenho.md
│   └── architecture.md      ← este documento
├── docker-compose.yml
├── AGENTS.md
└── README.md
```

---

## Adequação Funcional

### Fonte Única de Verdade

* O **backend (NestJS)** é a única fonte de verdade para regras de negócio. Nenhuma regra de negócio deve existir no frontend.
* O **PostgreSQL** é a fonte de verdade para dados transacionais e de progresso do usuário.
* O **Redis** é a fonte de verdade para dados de sessão e rankings em tempo real.
* A aplicação frontend web é consumidora das APIs; não toma decisões de negócio.

### Política de Comunicação entre Camadas

Todas as operações de negócio devem ocorrer através de:

* **API REST `/api/v1`** — única porta de entrada para clientes externos.
* **Camadas internas do NestJS**: `Controller → Use Case (Application) → Domain Service → Repository → Prisma`.

É proibido:

* Acessar o banco de dados (PostgreSQL) diretamente fora dos Repositories.
* Chamar serviços internos do NestJS sem passar pela camada Application (Use Cases).
* Criar regras de negócio em Controllers, Resolvers ou camadas de UI.
* Expor serviços administrativos ou internos em rotas públicas.

### APIs e Versionamento

Base URL:

```text
https://api.linguoup.com/api/v1
```

Estratégia de versionamento:

```text
URI Versioning — /api/v1/... → /api/v2/... (quando houver breaking changes)
```

### Endpoints Públicos

* `POST /api/v1/auth/register` — Criação de conta (e-mail)
* `POST /api/v1/auth/login` — Autenticação por e-mail/senha
* `POST /api/v1/auth/refresh` — Renovação do access token
* `POST /api/v1/auth/logout` — Encerramento de sessão

### Endpoints Protegidos

**Usuário**
* `GET  /api/v1/users/me` — Perfil do usuário autenticado
* `PATCH /api/v1/users/me` — Atualização de perfil

**Lições**
* `GET  /api/v1/lessons` — Catálogo de lições (com filtros)
* `GET  /api/v1/lessons/{id}` — Detalhe de lição
* `POST /api/v1/lessons/{id}/complete` — Registrar conclusão

**Progresso**
* `GET /api/v1/progress` — Progresso geral
* `GET /api/v1/streak` — Streak atual e histórico

**Gamificação**
* `GET /api/v1/achievements` — Conquistas do usuário
* `GET /api/v1/xp` — XP acumulado e histórico

**Revisão Inteligente**
* `GET  /api/v1/reviews/recommended` — Itens para revisão espaçada
* `POST /api/v1/reviews/complete` — Registrar resultado de revisão

**Conversação com IA (V3)**
* `POST /api/v1/ai/conversation` — Iniciar/continuar sessão de conversação
* `POST /api/v1/ai/feedback` — Solicitar feedback da sessão

### Contrato de API

* APIs devem ser versionadas (URI Versioning).
* APIs devem possuir documentação OpenAPI (gerada automaticamente via Swagger no NestJS).
* Payloads utilizam formato **JSON**.
* Coleções devem suportar **paginação** (cursor ou offset).
* Filtros e ordenação devem ser expostos como query parameters quando aplicável.
* Cabeçalho de autenticação: `Authorization: Bearer <access_token>`.

Padrão de resposta de sucesso:

```json
{
  "data": {},
  "metadata": {}
}
```

Padrão de resposta de erro:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### Estratégia de Tenancy

#### MVP

* **Single Tenant Application com Multi-Tenant Ready**: o MVP não exige separação entre organizações, mas toda entidade principal deve conter `tenant_id` para isolamento lógico futuro.
* Identificação do tenant via **JWT Claims** e **Request Context**.
* Todos os acessos devem validar `tenant_id` antes de qualquer operação de leitura ou escrita.

#### Evolução Futura

* Migração para isolamento por schema ou banco de dados dedicado, conforme crescimento da base de clientes B2B (V4 — Planos Corporativos).

---

## Eficiência de Desempenho

### Comunicação entre Componentes

* **Protocolo:** HTTPS (TLS 1.3 obrigatório)
* **Formato:** JSON
* **Requisitos de segurança:** Todos os endpoints protegidos exigem `Authorization: Bearer <token>` com validação de `tenant_id` e escopo RBAC.
* **Timeout padrão de API:** 30 segundos
* **Objetivo de tempo de carregamento de tela:** ≤ 2 segundos (RNF-02)

### Rate Limiting

* Usuário anônimo: **20 requisições/minuto** por IP
* Usuário autenticado: **300 requisições/minuto** por `user_id`
* Endpoint de auth (register/login): **10 requisições/minuto** por IP (proteção contra brute-force)

### Transações e Persistência

* Todas as operações que envolvam múltiplas entidades devem usar **transações Prisma** (`$transaction`).
* Progresso do usuário deve ser persistido de forma atômica (conclusão de lição + atualização de XP + streak em uma única transação).
* Modo offline: lições e progresso são armazenados localmente (MMKV) e sincronizados automaticamente ao reconectar via fila de sincronização no TanStack Query.

### Cache

| Dado                        | TTL Recomendado | Estratégia      |
| --------------------------- | --------------- | --------------- |
| Sessão do usuário (Redis)   | 15 minutos (sliding) | Cache-aside |
| Ranking / Leaderboard       | 5 minutos        | Cache-aside     |
| Catálogo de lições          | 1 hora           | Cache-aside     |
| Conteúdo multimídia (CDN)   | 24 horas         | CloudFront      |

### Estratégias Futuras de Escalabilidade

* **Extração do Motor de Recomendação** para serviço dedicado (Growth Stage), com comunicação REST/gRPC.
* **Extração do Serviço de Notificações** para serviço dedicado com suporte a filas (SQS/SNS).
* **Event-Driven Architecture com Kafka** para eventos de progresso, gamificação e notificações (Scale Stage).
* **Horizontal scaling** de pods NestJS via Kubernetes HPA (Horizontal Pod Autoscaler).
* **Read replicas** PostgreSQL para consultas de progresso e dashboard analítico.

---

## Compatibilidade

### Integração

| Sistema             | Tipo                | Protocolo     | Observações                          |
| ------------------- | ------------------- | ------------- | ------------------------------------ |
| Auth0 / AWS Cognito | Identidade          | OIDC / OAuth 2.1 | JWT RS256. MVP: Auth0. Evolução: Cognito |
| Google Sign-In      | Provedor social     | OAuth 2.1     | Integrado via Auth0                  |
| Apple Sign-In       | Provedor social     | OAuth 2.1     | Integrado via Auth0                  |
| AWS S3              | Storage             | HTTPS         | Áudios, imagens, conteúdo offline    |
| AWS CloudFront      | CDN                 | HTTPS         | Distribuição de mídia estática       |
| AWS KMS             | Criptografia        | AWS SDK       | Gerenciamento de chaves de criptografia |
| AWS SES / Firebase Cloud Messaging | Notificações | HTTPS | Push (FCM/APNs) e e-mail (SES)    |
| Prometheus + Grafana | Métricas           | HTTP Scrape   | Métricas de aplicação e infraestrutura |
| OpenTelemetry       | Tracing / Logs      | OTLP          | Instrumentação centralizada          |
| Sentry              | Erros               | HTTPS         | Monitoramento de exceções            |
| SonarQube           | SAST                | CI Pipeline   | Análise estática de código           |
| Trivy               | Container Scanning  | CI Pipeline   | Varredura de vulnerabilidades        |
| Dependabot          | Dependency Scanning | GitHub        | Atualização automática de dependências |

### Suporte de Plataformas

* **Web (Client/Admin):** Chrome, Firefox, Safari, Edge — últimas 2 versões

### Conformidade

* **LGPD** (Lei Geral de Proteção de Dados Pessoais) — dados pessoais criptografados, consentimento registrado, direito ao esquecimento implementado.
* **WCAG 2.1 Nível AA** — acessibilidade na aplicação web.
* **OWASP Top 10** — proteções contra SQL Injection, XSS, CSRF, SSRF aplicadas em todas as camadas.

---

## Segurança

### Autenticação e Gestão de Sessão

* **Protocolo:** OAuth 2.1 + OIDC
* **Token de acesso:** JWT (RS256), expiração curta (15 min)
* **Refresh Token:** Rotativo, HTTPOnly, expiração longa (30 dias)
* **MFA:** Opcional no MVP, obrigatório para perfis Admin e Super_Admin
* **Revogação de sessão:** Suportada via blacklist no Redis

### Controle de Acesso (RBAC)

| Perfil        | Permissões                                                                   |
| ------------- | ---------------------------------------------------------------------------- |
| `USER`        | Consumir lições, ver progresso próprio, gerenciar perfil pessoal             |
| `ADMIN`       | Gestão de conteúdo, visualização de relatórios, operação da plataforma       |
| `SUPER_ADMIN` | Administração completa: usuários, configurações, métricas globais, tenants   |

### Segurança de Dados

| Camada          | Mecanismo                |
| --------------- | ------------------------ |
| Dados em trânsito | TLS 1.3 obrigatório    |
| Dados em repouso  | AES-256 (AWS RDS + S3) |
| Senhas           | Argon2id                 |
| Chaves           | AWS KMS                  |
| Segredos de app  | AWS Secrets Manager      |

### Infraestrutura de Segurança

* **WAF** (AWS Web Application Firewall) na borda.
* **Network Segmentation:** backend e banco de dados em private subnets; apenas o load balancer exposto.
* **DDoS Protection:** AWS Shield Standard.
* **Rate Limiting:** configurado por camada de API Gateway e NestJS.

### DevSecOps

| Etapa do Pipeline | Ferramenta    | Objetivo                                  |
| ----------------- | ------------- | ----------------------------------------- |
| SAST              | SonarQube     | Análise estática de código               |
| DAST              | OWASP ZAP     | Testes dinâmicos de segurança            |
| Container Scan    | Trivy         | Vulnerabilidades em imagens Docker        |
| Dependency Scan   | Dependabot    | CVEs em dependências npm/pnpm             |

---

## Observabilidade

### Pilares

| Pilar   | Ferramenta            | Descrição                                        |
| ------- | --------------------- | ------------------------------------------------ |
| Logs    | Loki + Grafana        | Logs estruturados JSON por domínio e nível       |
| Métricas | Prometheus + Grafana | Latência, taxa de erros, throughput, DAU         |
| Tracing | OpenTelemetry + Jaeger/Tempo | Rastreamento distribuído de requests       |
| Alertas | Grafana Alertmanager  | Alertas por threshold de SLO/SLA                 |
| Erros   | Sentry                | Captura de exceções com contexto de usuário      |

### Requisitos Obrigatórios

Toda nova funcionalidade deve incluir:

* Logs estruturados com campos: `timestamp`, `level`, `service`, `trace_id`, `span_id`, `user_id`, `tenant_id`.
* Métricas de performance (latência p50/p95/p99 por endpoint).
* Tracing distribuído via cabeçalhos W3C Trace Context.
* Tratamento e captura de erros no Sentry com contexto de usuário (sem dados sensíveis).

### SLOs

| Indicador                   | Meta              |
| --------------------------- | ----------------- |
| Disponibilidade             | ≥ 99,5% mensal    |
| Latência p95 (API)          | ≤ 500ms           |
| Carregamento de tela (web)   | ≤ 2 segundos     |
| Taxa de erro (5xx)          | ≤ 0,1%            |

---

## Roadmap Arquitetural

### V1 — MVP (Modular Monolith)

**Objetivo:** Validar engajamento, frequência de uso e retenção.

Componentes ativos:
* Monólito NestJS com domínios: `auth`, `users`, `learning`, `progress`, `gamification`, `notifications`
* Motor de recomendação (repetição espaçada) **embutido** na camada `learning`
* PostgreSQL (AWS RDS) + Redis (ElastiCache)
* Auth0 como provedor de identidade
* AWS S3 + CloudFront para mídia
* Next.js (portal do aluno e painel administrativo)

---

### V2 — Growth Stage

**Objetivo:** Aumentar retenção e percepção de progresso.

Extrações planejadas:
* **Notification Service** — serviço dedicado com suporte a filas (AWS SQS + SNS, Firebase Cloud Messaging, AWS SES)
* **Recommendation Engine Service** — serviço dedicado de repetição espaçada com persistência própria
* Novos idiomas de aprendizado
* Dashboard analítico avançado

---

### V3 — Scale Stage (Microservices + IA)

**Objetivo:** Aumentar proficiência e monetização.

Extrações planejadas:
* **Learning Service** — lições, trilhas, exercícios
* **Progress Service** — progresso, streak, metas
* **Gamification Service** — XP, conquistas, rankings
* **AI Conversation Service** — conversação com LLM, correção gramatical, feedback de fala
* Event-Driven Architecture com **Apache Kafka**
* Migração de Auth0 para **AWS Cognito**

---

### V4 — Enterprise Stage

**Objetivo:** Expandir receita e mercado B2B.

Funcionalidades:
* Certificações de proficiência
* Planos corporativos com isolamento de tenant por schema/banco
* Integração com plataformas educacionais externas (LMS)
* Trilhas profissionais específicas por setor

---

## Diretrizes para Desenvolvimento Assistido por IA

### Backend (NestJS)

* Seguir **Clean Architecture**: Controller → Use Case → Domain Service → Repository.
* Aplicar **DDD leve**: entidades de domínio com regras de negócio encapsuladas.
* Não acessar banco diretamente fora dos Repositories.
* Toda regra de negócio deve residir na camada `Domain` ou `Application`.
* Validar `tenant_id`, autorização e entrada de dados em todo Use Case.

### Frontend (Next.js)

* Componentes reutilizáveis, responsáveis apenas pela renderização.
* Separação entre UI e lógica: hooks para acesso a APIs (TanStack Query) e estado global (Zustand).
* Evitar lógica de negócio em telas e componentes.
* Seguir o Design System definido na `spec_ui.md` (cards, barras de progresso, badges, bottom sheets, toasts, skeleton loading).
* Máximo de **3 interações** para iniciar uma lição.
* Feedback visual imediato após cada ação do usuário.

### Banco de Dados

* Toda alteração de schema deve ter migration Prisma gerada e revisada.
* Proibido SQL hardcoded fora da camada de persistência (usar Prisma Query API).
* Rollback documentado para cada migration.

### APIs

* Documentação OpenAPI obrigatória (Swagger gerado automaticamente via NestJS).
* Contratos versionados — não alterar contratos existentes sem nova versão de API.
* Payloads padronizados: `{ data, metadata }` (sucesso) e `{ error: { code, message } }` (erro).

### Testes

| Tipo          | Cobertura mínima                                          |
| ------------- | --------------------------------------------------------- |
| Unitários     | 80% das regras de negócio (domínio e use cases)           |
| Integração    | Todos os fluxos críticos: auth, progresso, gamificação, cadastro, APIs |
| E2E           | Jornadas principais do usuário (onboarding, lição, streak, gamificação) |

Critério de conclusão de qualquer mudança:

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```
