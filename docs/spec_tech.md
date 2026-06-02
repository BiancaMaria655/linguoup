# Especificação Técnica

## Visão Geral Técnica

Este documento define a arquitetura técnica, padrões de desenvolvimento, requisitos de infraestrutura, segurança e integração para a plataforma de aprendizado de idiomas baseada em microaprendizagem.

O objetivo é fornecer um guia único para equipes de Engenharia, Arquitetura, Produto, DevOps, QA e IA Assistida, garantindo consistência técnica durante todo o ciclo de desenvolvimento.

### Objetivos Técnicos

* Suportar arquitetura escalável para crescimento até 1 milhão de usuários ativos.
* Garantir alta disponibilidade e segurança dos dados.
* Permitir evolução incremental do MVP para funcionalidades avançadas.
* Reduzir complexidade operacional nas primeiras versões.
* Facilitar desenvolvimento assistido por IA.
* Adotar arquitetura cloud-native.

---

# Arquitetura de Referência

## Estilo Arquitetural

Arquitetura Modular Monolith no MVP com evolução planejada para Microservices orientados a domínio.

Justificativa:

* Menor custo operacional inicial.
* Menor complexidade para equipe reduzida.
* Evolução gradual conforme crescimento do produto.

---

## Componentes Principais

### Frontend Mobile

Responsável por:

* Onboarding
* Lições
* Gamificação
* Dashboard
* Notificações
* Modo Offline

---

### API Backend

Responsável por:

* Autenticação
* Usuários
* Conteúdo
* Trilhas
* Gamificação
* Métricas
* Notificações

---

### Banco de Dados

Responsável por:

* Persistência transacional
* Controle de progresso
* Gestão de usuários

---

### Cache

Responsável por:

* Sessões
* Rankings
* Conteúdo frequentemente acessado

---

### Storage

Responsável por:

* Áudios
* Imagens
* Conteúdo multimídia
* Downloads offline

---

### Motor de Recomendação

Responsável por:

* Repetição espaçada
* Personalização
* Sugestão de conteúdos

Inicialmente implementado dentro do backend.

Posteriormente extraído para serviço dedicado.

---

### Serviço de IA Conversacional

Responsável por:

* Simulações de conversação
* Correções gramaticais
* Feedback de aprendizado

Disponível a partir da V3.

---

## Serviço de Observabilidade

Centralização de:

* Logs
* Métricas
* Tracing distribuído
* Alertas operacionais

---

## Autenticação e Autorização

Modelo:

* OAuth 2.1
* OpenID Connect (OIDC)
* JWT Access Token
* Refresh Token Rotativo

Provedores:

* Google
* Apple
* Login por e-mail

---

## Protocolos de Comunicação

### Cliente ↔ Backend

HTTPS REST API

Formato:

JSON

---

### Serviços Internos

REST inicialmente.

Evolução futura:

gRPC para comunicação entre microsserviços.

---

## Infraestrutura de Deployment

Cloud Provider:

AWS

Estratégia:

Containerizada

Orquestração:

Kubernetes (EKS)

Deployment:

Blue-Green Deployment

Rollback automático.

---

# Stack Tecnológica

## Frontend

* Linguagem: TypeScript
* Framework Mobile: React Native
* Framework Web Administrativo: Next.js
* Estilização: NativeWind + Tailwind CSS
* Gerenciamento de Estado: Zustand
* Data Fetching: TanStack Query

---

## Backend

* Linguagem: TypeScript
* Runtime: Node.js LTS
* Framework: NestJS
* Persistência: PostgreSQL
* Cache: Redis
* ORM: Prisma ORM

---

## Stack de Desenvolvimento

### IDE

* VS Code

### Gerenciamento de Pacotes

* pnpm

### Ambiente de Desenvolvimento Local

* Docker Compose

### Infraestrutura como Código (IaC)

* Terraform

### Pipeline CI/CD

* GitHub Actions

Fluxo:

1. Build
2. Testes
3. SAST
4. Deploy Staging
5. Aprovação
6. Produção

---

## Integrações

### Persistência

* PostgreSQL
* Redis
* S3

### Deployment

* AWS EKS
* AWS RDS
* AWS S3
* AWS CloudFront

### Segurança (Autenticação e Autorização)

* Auth0 (MVP)

ou

* AWS Cognito

---

### Observabilidade

* OpenTelemetry
* Prometheus
* Grafana
* Loki
* Sentry

---

# Segurança

## Autenticação e Gestão de Sessão

### Requisitos

* OAuth 2.1
* OIDC
* MFA opcional
* Refresh Token Rotation
* Revogação de sessão

---

## Controle de Acesso e Autorização

Modelo:

RBAC

Perfis:

### USER

* Consumidor da plataforma

### ADMIN

* Gestão de conteúdo
* Relatórios
* Operação

### SUPER_ADMIN

* Administração da plataforma

---

## Segurança de Dados e Validação

Todas as entradas devem:

* Ser validadas no Backend
* Possuir sanitização
* Possuir proteção contra injeções

Proteções:

* SQL Injection
* NoSQL Injection
* XSS
* CSRF
* SSRF

---

### Criptografia e Proteção de Dados

Dados em trânsito:

TLS 1.3

Dados em repouso:

AES-256

Senhas:

Argon2id

Chaves:

AWS KMS

---

## Segurança da Infraestrutura e Configuração

* Secrets Manager
* Network Segmentation
* Private Subnets
* WAF
* Rate Limiting
* DDoS Protection

---

## Segurança no Desenvolvimento e Operação (DevSecOps)

Pipeline obrigatório:

* SAST
* DAST
* Dependency Scanning
* Container Scanning

Ferramentas:

* SonarQube
* Trivy
* Dependabot

---

# APIs

## Convenções Gerais

Base URL:

/api/v1

Versionamento:

URI Versioning

Exemplo:

/api/v1/users

---

## Padrão de Nomenclatura

Recursos:

Plural

Exemplos:

/users
/lessons
/courses
/progress

Métodos:

GET
POST
PUT
PATCH
DELETE

---

## Autenticação

Header:

Authorization: Bearer <token>

---

## Endpoints Públicos

### Auth

POST /api/v1/auth/register

POST /api/v1/auth/login

POST /api/v1/auth/refresh

POST /api/v1/auth/logout

---

## Endpoints Protegidos

### Usuário

GET /api/v1/users/me

PATCH /api/v1/users/me

---

### Lições

GET /api/v1/lessons

GET /api/v1/lessons/{id}

POST /api/v1/lessons/{id}/complete

---

### Progresso

GET /api/v1/progress

GET /api/v1/streak

---

### Gamificação

GET /api/v1/achievements

GET /api/v1/xp

---

### Revisão Inteligente

GET /api/v1/reviews/recommended

POST /api/v1/reviews/complete

---

### Conversação IA (V3)

POST /api/v1/ai/conversation

POST /api/v1/ai/feedback

---

## Padrão de Resposta

Sucesso:

```json
{
  "data": {},
  "metadata": {}
}
```

Erro:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Resource not found"
  }
}
```

---

# Tenancy

## Estratégia

Single Tenant Application

Multi-Tenant Ready

O MVP não exige separação entre organizações.

---

## Isolamento

Logical Isolation

Identificação por:

```text
tenant_id
```

presente em todas as entidades principais.

---

## Identificação

Extração via:

* JWT Claims
* Request Context

---

## Migrações

Ferramenta:

Prisma Migrate

Requisitos:

* Versionamento obrigatório
* Rollback documentado
* Compatibilidade retroativa

---

## Segurança

Todos os acessos deverão validar:

```text
tenant_id
```

antes de qualquer operação de leitura ou escrita.

---

# Diretrizes para Desenvolvimento Assistido por IA

## Objetivo

Garantir que ferramentas de IA gerem código consistente com os padrões arquiteturais da plataforma.

---

## Regras Obrigatórias

### Backend

* Seguir Clean Architecture.
* Utilizar Domain Driven Design (DDD) leve.
* Não acessar banco diretamente fora dos Repositories.
* Toda regra de negócio deve residir na camada Domain/Application.

---

### Frontend

* Componentes reutilizáveis.
* Separação entre UI e lógica.
* Hooks para acesso a APIs.
* Evitar lógica de negócio em telas.

---

### Banco de Dados

* Toda alteração deve possuir migration.
* Proibir SQL hardcoded fora da camada de persistência.

---

### APIs

* OpenAPI obrigatório.
* Swagger gerado automaticamente.
* Contratos versionados.

---

### Testes

Cobertura mínima:

* Unitários: 80%
* Integração: Fluxos críticos
* E2E: Jornadas principais

---

### Observabilidade

Toda nova funcionalidade deve incluir:

* Logs estruturados
* Métricas
* Tratamento de erros
* Tracing

---

### Segurança

Toda funcionalidade deve validar:

* Autorização
* Entrada de dados
* Escopo do usuário
* Tenant

---

## Estrutura Inicial de Domínios

### Auth

* Login
* Registro
* Sessão

### Users

* Perfil
* Preferências

### Learning

* Cursos
* Lições
* Exercícios

### Progress

* Evolução
* Streak
* Metas

### Gamification

* XP
* Conquistas

### Notifications

* Push
* E-mail

### AI Learning

* Conversação
* Feedback
* Recomendações

---

## Roadmap Arquitetural

### MVP

Monólito Modular + PostgreSQL

---

### Growth Stage

Extração dos serviços:

* Notifications
* Recommendation Engine

---

### Scale Stage

Microservices:

* Learning Service
* Progress Service
* Gamification Service
* AI Service

Com Event-Driven Architecture baseada em Kafka.
