# LinguoUp

Plataforma **mobile-first** de aprendizado de idiomas baseada em **microaprendizagem**. Transforma pequenos momentos do dia em oportunidades de estudo por meio de lições rápidas, personalização, gamificação e mecanismos de formação de hábitos.

## Sobre o projeto

Milhões de pessoas desejam aprender um novo idioma, mas enfrentam dificuldades para manter uma rotina consistente de estudos. A falta de tempo, a baixa motivação e a dificuldade em transformar o aprendizado em um hábito diário levam a altas taxas de abandono antes que os usuários alcancem proficiência.

O **LinguoUp** foi concebido para adultos entre 18 e 45 anos com rotinas ocupadas, oferecendo uma forma simples, acessível e contínua de aprender idiomas sem exigir longos períodos de dedicação diária.

### Diferenciais

- Microlições de 3 a 5 minutos
- Aprendizado adaptado à rotina do usuário
- Gamificação focada em formação de hábito
- Reforço inteligente com repetição espaçada
- Prática contextual baseada em situações do cotidiano
- Metas diárias personalizáveis
- Experiência mobile-first com acesso offline (versões futuras)
- Sistema de lembretes inteligentes baseado em comportamento

## Funcionalidades

| Versão | Escopo |
|--------|--------|
| **V1 (MVP)** | Cadastro e login, onboarding personalizado, avaliação de nível, microlições, streak, metas diárias, notificações, dashboard básico e gamificação básica |
| **V2** | Repetição espaçada avançada, conteúdo offline, trilhas personalizadas, novos idiomas e dashboard avançado |
| **V3** | Conversação com IA, feedback automatizado de fala, comunidade e desafios sociais |
| **V4** | Certificações, integração educacional, planos corporativos e trilhas profissionais |

Principais requisitos funcionais do MVP:

- **RFN-01** — Cadastro e onboarding personalizado (e-mail, Google ou Apple)
- **RFN-02** — Avaliação de nível inicial
- **RFN-03** — Microlições diárias (3–5 minutos)
- **RFN-04** — Sistema de formação de hábito (streak e metas)
- **RFN-05** — Notificações inteligentes
- **RFN-06** — Repetição espaçada
- **RFN-07** — Gamificação (XP, conquistas e níveis)
- **RFN-08** — Dashboard de progresso
- **RFN-09** — Modo offline
- **RFN-10** — Prática de conversação com IA (V3)

## Arquitetura

O projeto adota uma **arquitetura modular monolith** no MVP, com evolução planejada para microsserviços orientados a domínio.

```text
┌─────────────────┐     HTTPS/REST      ┌─────────────────┐
│  App Mobile     │ ◄─────────────────► │  API Backend    │
│  (React Native) │                     │  (NestJS)       │
└─────────────────┘                     └────────┬────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    ▼                          ▼                          ▼
             ┌────────────┐            ┌────────────┐            ┌────────────┐
             │ PostgreSQL │            │   Redis    │            │     S3     │
             └────────────┘            └────────────┘            └────────────┘
```

### Componentes principais

| Componente | Responsabilidade |
|------------|------------------|
| Frontend Mobile | Onboarding, lições, gamificação, dashboard, notificações e modo offline |
| API Backend | Autenticação, usuários, conteúdo, trilhas, gamificação, métricas e notificações |
| Banco de Dados | Persistência transacional, progresso e gestão de usuários |
| Cache | Sessões, rankings e conteúdo frequentemente acessado |
| Storage | Áudios, imagens, conteúdo multimídia e downloads offline |
| Motor de Recomendação | Repetição espaçada, personalização e sugestão de conteúdos |

## Stack tecnológica

### Frontend

| Tecnologia | Uso |
|------------|-----|
| TypeScript | Linguagem |
| React Native | Aplicativo mobile |
| Next.js | Painel web administrativo |
| NativeWind + Tailwind CSS | Estilização |
| Zustand | Gerenciamento de estado |
| TanStack Query | Data fetching |

### Backend

| Tecnologia | Uso |
|------------|-----|
| TypeScript | Linguagem |
| Node.js LTS | Runtime |
| NestJS | Framework |
| PostgreSQL | Banco de dados |
| Redis | Cache |
| Prisma ORM | Persistência |

### Infraestrutura e DevOps

| Tecnologia | Uso |
|------------|-----|
| AWS (EKS, RDS, S3, CloudFront) | Cloud provider |
| Docker Compose | Ambiente local |
| Terraform | Infraestrutura como código |
| GitHub Actions | CI/CD |
| OpenTelemetry, Prometheus, Grafana, Loki, Sentry | Observabilidade |

### Autenticação

- OAuth 2.1 e OpenID Connect (OIDC)
- JWT Access Token com Refresh Token rotativo
- Provedores: Google, Apple e login por e-mail

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) **v20 LTS ou superior**
- [pnpm](https://pnpm.io/) **v9 ou superior** — `npm install -g pnpm`
- [Docker](https://www.docker.com/) e Docker Compose v2
- [Git](https://git-scm.com/)

## Como começar

### 1. Clonar o repositório

```bash
git clone https://github.com/<seu-usuario>/TrabalhoImplementa-oEvolu-oSoftware.git
cd TrabalhoImplementa-oEvolu-oSoftware
```

### 2. Instalar dependências

```bash
pnpm install
```

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Edite o .env se necessário (os valores padrão funcionam para desenvolvimento local)
```

Principais variáveis:

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `DATABASE_URL` | Connection string do PostgreSQL | `postgresql://linguoup:linguoup_dev@localhost:5432/linguoup` |
| `REDIS_URL` | Connection string do Redis | `redis://localhost:6379` |
| `POSTGRES_USER` | Usuário do PostgreSQL | `linguoup` |
| `POSTGRES_PASSWORD` | Senha do PostgreSQL | `linguoup_dev` |
| `POSTGRES_DB` | Nome do banco de dados | `linguoup` |
| `PGADMIN_EMAIL` | E-mail do pgAdmin | `admin@linguoup.local` |
| `PGADMIN_PASSWORD` | Senha do pgAdmin | `linguoup_admin` |

> **Importante:** nunca commite o arquivo `.env` com credenciais reais.

### 4. Subir a infraestrutura local

```bash
docker compose up -d
# Aguardar PostgreSQL e Redis ficarem healthy (verificar com: docker compose ps)
```

### 5. Aplicar migrations do banco de dados

```bash
pnpm db:migrate
```

### 6. Iniciar o ambiente de desenvolvimento

```bash
# Todos os apps
pnpm dev

# Ou individualmente
pnpm dev --filter=api     # NestJS API em http://localhost:3000
pnpm dev --filter=web     # Next.js Admin em http://localhost:3001
pnpm dev --filter=mobile  # Expo Metro bundler
```

### 7. Acessar a aplicação

| Serviço | URL |
|---------|-----|
| API Backend | `http://localhost:3000/api/v1` |
| Web Admin (Next.js) | `http://localhost:3001` |
| pgAdmin | `http://localhost:5050` |

## Estrutura do repositório

```text
.
├── apps/
│   ├── api/        # NestJS — auth, users, learning, progress, gamification
│   ├── web/        # Next.js — painel administrativo (App Router)
│   └── mobile/     # React Native + Expo — app móvel
├── packages/
│   ├── config/     # ESLint, TSConfig e Prettier compartilhados
│   ├── ui/         # Componentes UI compartilhados (design system)
│   └── database/   # Schema Prisma e client (CHG-003)
├── docs/
│   ├── architecture.md
│   ├── prd.md
│   ├── spec_tech.md
│   └── spec_ui.md
├── docker-compose.yml
├── .env.example
├── pnpm-workspace.yaml
└── README.md
```

## Comandos úteis

```bash
# Desenvolvimento
pnpm dev                    # todos os apps
pnpm dev --filter=api       # apenas API
pnpm dev --filter=web       # apenas web admin
pnpm dev --filter=mobile    # apenas mobile

# Build
pnpm build                  # todos os apps
pnpm build --filter=api     # apenas API
pnpm build --filter=web     # apenas web

# Qualidade
pnpm lint                   # linting em todos os packages
pnpm typecheck              # type check em todos os packages
pnpm test                   # testes em todos os packages

# Banco de dados
pnpm db:migrate             # aplicar migrations (produção)
pnpm db:migrate:dev         # criar nova migration (dev)
pnpm db:seed                # popular dados iniciais
pnpm db:studio              # abrir Prisma Studio

# Docker
docker compose up -d        # subir infraestrutura
docker compose down         # parar infraestrutura
docker compose ps           # verificar status dos serviços
```

## Documentação

A documentação completa do projeto está na pasta [`docs/`](docs/):

| Documento | Conteúdo |
|-----------|----------|
| [Definição do Problema](docs/definicao_problema.md) | Contexto, público-alvo e objetivos |
| [PRD — Requisitos do Produto](docs/prd.md) | Funcionalidades, personas, métricas e roadmap de versões |
| [Especificação Técnica](docs/spec_tech.md) | Arquitetura, stack, APIs, segurança e diretrizes de desenvolvimento |
| [Especificação de UI](docs/spec_ui.md) | Interfaces, fluxos de navegação e diretrizes de UX |
| [Prompt de Design](docs/prompt_desenho.md) | Diretrizes para prototipação mobile-first |

## API

A API segue o padrão REST com versionamento por URI. Base URL: `/api/v1`.

Exemplos de endpoints:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/v1/auth/register` | Cadastro de usuário |
| `POST` | `/api/v1/auth/login` | Login |
| `GET` | `/api/v1/users/me` | Perfil do usuário autenticado |
| `GET` | `/api/v1/lessons` | Listagem de lições |
| `POST` | `/api/v1/lessons/{id}/complete` | Conclusão de lição |
| `GET` | `/api/v1/streak` | Sequência diária (streak) |
| `GET` | `/api/v1/progress` | Progresso do usuário |

Contratos detalhados, padrões de resposta e convenções estão em [docs/spec_tech.md](docs/spec_tech.md#apis).

## Métricas de sucesso

O produto será avaliado com base em:

- **Aquisição** — novos usuários, conversão do onboarding e CAC
- **Engajamento** — DAU/WAU, tempo médio de uso e lições concluídas
- **Retenção** — retenção D1/D7/D30, manutenção de streak e churn
- **Aprendizado** — conclusão de trilhas, retenção de vocabulário e evolução de proficiência
- **Negócio** — conversão premium, MRR e relação LTV/CAC

## Segurança e conformidade

- Criptografia em trânsito (TLS 1.3) e em repouso (AES-256)
- Conformidade com LGPD
- Acessibilidade WCAG 2.1 nível AA
- Disponibilidade mínima de 99,5% mensal
- Pipeline DevSecOps com SAST, DAST e varredura de dependências

## Roadmap

```text
MVP (V1)          → Validar engajamento, frequência e retenção
V2                → Aumentar retenção e percepção de progresso
V3                → Aumentar proficiência e monetização
V4                → Expandir receita e mercado B2B
```

Evolução arquitetural planejada:

1. **MVP** — Monólito modular + PostgreSQL
2. **Growth** — Extração de Notifications e Recommendation Engine
3. **Scale** — Microsserviços com arquitetura orientada a eventos (Kafka)

## Contribuindo

Este repositório faz parte de um trabalho acadêmico de Implementação e Evolução de Software. Para contribuir:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/minha-feature`)
3. Commit suas alterações seguindo as convenções do projeto
4. Abra um Pull Request descrevendo as mudanças

Consulte a [especificação técnica](docs/spec_tech.md#diretrizes-para-desenvolvimento-assistido-por-ia) para padrões de código, arquitetura e cobertura de testes.

## Licença

Este projeto é desenvolvido no âmbito acadêmico. Consulte os mantenedores do repositório para informações sobre licenciamento.

## Ajuda e suporte

- Documentação do produto: pasta [`docs/`](docs/)
- Issues: utilize a aba **Issues** deste repositório para reportar bugs ou solicitar funcionalidades

## CI/CD

O projeto usa **GitHub Actions** para automação de build, testes, análise de segurança e deploy.

### Fluxo de branches

```text
feature/* ──► develop ──► main
                │              │
                ▼              ▼
           CD Staging     (merge manual
           (automático)    após aprovação)
                               │
                               ▼
                         CD Produção
                      (aprovação manual
                       obrigatória)
```

| Evento | Workflow | Resultado |
|--------|----------|-----------|
| Pull Request → `main`/`develop` | `ci.yml` | lint + typecheck + test + build |
| Pull Request → `main`/`develop` | `security.yml` | SonarCloud SAST + Trivy scan |
| Push → `develop` | `cd-staging.yml` | Build imagens Docker + deploy staging |
| Push de tag `v*` ou dispatch manual | `cd-production.yml` | Promoção de imagem + deploy produção (com aprovação) |

### Secrets necessários no GitHub

Configure em **Settings → Secrets and variables → Actions**:

| Secret | Descrição | Obrigatório |
|--------|-----------|-------------|
| `SONAR_TOKEN` | Token de autenticação do SonarCloud | Opcional (análise pulada se ausente) |
| `EXPO_TOKEN` | Token de autenticação do Expo / EAS | Opcional (build mobile pulado se ausente) |
| `ECR_REGISTRY` | URL do registry AWS ECR (`<account>.dkr.ecr.<region>.amazonaws.com`) | Opcional até CHG-003 (push pulado se ausente) |
| `AWS_ACCESS_KEY_ID` | Credencial AWS para login no ECR | Necessário junto com `ECR_REGISTRY` |
| `AWS_SECRET_ACCESS_KEY` | Credencial AWS para login no ECR | Necessário junto com `ECR_REGISTRY` |

### Configurar environment `production` com aprovação obrigatória

1. Acesse **Settings → Environments** no repositório GitHub
2. Clique em **New environment** e nomeie como `production`
3. Em **Protection rules**, marque **Required reviewers**
4. Adicione os revisores autorizados para approve de deploy em produção
5. Salve — o job `deploy-production` ficará em estado `waiting` até aprovação

Repita os passos 1–4 para criar o environment `staging` (sem required reviewers).

### Rodar checks de CI localmente

```bash
# Mesmo pipeline que o GitHub Actions executa
pnpm lint && pnpm typecheck && pnpm test && pnpm build

# Por app individualmente
pnpm lint --filter=api
pnpm typecheck --filter=web
pnpm test --filter=api

# Build das imagens Docker (requer Docker instalado)
docker build -t linguoup-api -f apps/api/Dockerfile .
docker build -t linguoup-web -f apps/web/Dockerfile .
```

---


Desenvolvido como parte do curso de **Implementação e Evolução de Software**.
