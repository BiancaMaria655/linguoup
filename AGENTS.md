# AGENTS.md — LinguoUp

> Instruções operacionais para agentes de IA. Não é documentação para humanos.
> **Prioridade 1: Testes passando. Prioridade 2: Correção. Prioridade 3: Velocidade.**

---

## 1. Core Principles

- Simplicidade > Complexidade.
- Código existente > Código novo.
- Entendimento > Velocidade.
- Fazer a menor mudança possível.
- Evitar abstrações prematuras.
- Não refatorar código adjacente sem necessidade.
- Não adicionar código especulativo.
- Preservar padrões já existentes do projeto.

---

## 2. Comportamento Geral

**Pense antes de codar. Não assuma. Não invente. Pergunte quando incerto.**

- Leia o código existente antes de qualquer alteração.
- Se múltiplas interpretações existirem, apresente-as — não escolha silenciosamente.
- Se algo estiver confuso, pare. Nomeie a dúvida. Pergunte.
- Mínimo de código que resolve o problema. Nada especulativo.
- Não refatore código adjacente. Não adicione abstrações não solicitadas.
- Toque apenas o que você deve. Preserve estilo existente, mesmo que prefira outro.
- Explique hipóteses, limitações e riscos quando existirem.

---

## 3. Investigação (Read before write)

Antes de qualquer implementação:

1. Ler os arquivos envolvidos.
2. Entender o fluxo atual.
3. Identificar convenções e padrões existentes.
4. Reutilizar estruturas já presentes.
5. Somente então implementar.

---

## 4. Planejamento Obrigatório

Nunca iniciar implementação diretamente. Sempre:

1. Explicar a abordagem antes de codar.
2. Identificar os arquivos que serão alterados.
3. Explicar riscos e trade-offs.
4. Em caso de incerteza ou múltiplas interpretações: apresentar alternativas e solicitar esclarecimento.

---

## 5. Workflow

Para qualquer mudança:

1. Ler arquivos envolvidos.
2. Consultar docs relevantes (ver seção 13).
3. Verificar documentação da biblioteca via Context7 (ver seção 12).
4. Explicar plano de implementação antes de codar.
5. Implementar em pequenas etapas.
6. Executar critério de conclusão (ver seção 10).
7. Refletir e propor melhorias (ver seção 14).

---

## 6. Regras de Implementação

- Preferir código simples e direto.
- Reutilizar código existente antes de criar novo.
- Não introduzir dependências sem necessidade (ver seção 7).
- Evitar abstrações prematuras.
- Não criar helpers genéricos especulativos.
- Não renomear arquivos sem necessidade.
- Não modificar estilo ou formatação já existentes.
- Não realizar grandes refatorações não solicitadas.
- Alterar apenas o necessário para resolver o problema.

---

## 7. Dependências

Antes de adicionar qualquer nova biblioteca:

1. Verificar se já existe solução equivalente no projeto.
2. Justificar a necessidade explicitamente.
3. Consultar a documentação oficial via Context7.
4. Solicitar aprovação antes da inclusão.

Evitar duplicação de responsabilidades entre bibliotecas.

---

## 8. Stack Tecnológica

| Camada          | Tecnologia                                              |
| --------------- | ------------------------------------------------------- |
| Web (Client/Admin) | Next.js (App Router) + Tailwind CSS + Zustand + Query |
| Backend         | NestJS + TypeScript + Node.js LTS                       |
| Banco           | PostgreSQL 15+ + Prisma ORM                             |
| Cache           | Redis 7+                                                |
| Storage         | AWS S3 + CloudFront                                     |
| Autenticação    | Auth0 (MVP) → AWS Cognito                               |
| Observabilidade | OpenTelemetry + Prometheus + Grafana + Loki + Sentry    |
| Package Manager | pnpm                                                    |
| Infra Local     | Docker Compose                                          |
| IaC             | Terraform                                               |
| CI/CD           | GitHub Actions (Build → Testes → SAST → Staging → Prod) |

**Tabela de decisão de estado:**

| Cenário                           | Usar           |
| --------------------------------- | -------------- |
| Cache de servidor / dados remotos | TanStack Query |
| Estado global de UI / preferências | Zustand       |
| Formulários locais                | useState       |

---

## 9. Estrutura do Monorepo

```text
.
├── apps/
│   ├── web/           # Next.js — portal do aluno (onboarding, lições, etc.) e painel administrativo
│   └── api/           # NestJS — auth, users, learning, progress, gamification, notifications
├── packages/
│   ├── ui/            # Componentes compartilhados (design system)
│   ├── config/        # ESLint, TSConfig, Prettier
│   └── database/      # Schema Prisma e migrations
├── docs/
├── docker-compose.yml
└── AGENTS.md
```

**Fluxo de dependência:**

```text
apps/* → packages/*
```

Restrições:
- `packages` não podem depender de `apps`.
- Evitar dependências circulares.
- Componentes compartilhados permanecem em `packages/`.
- Manter baixo acoplamento entre aplicações.
- Preservar os limites arquiteturais do monorepo.

**Regras arquiteturais:**
- Backend: Clean Architecture. Fluxo: `Controller → Use Case → Domain Service → Repository`.
- Regras de negócio residem exclusivamente na camada `Domain`/`Application`.
- Não acessar banco diretamente fora dos Repositories.
- Frontend: separar UI de lógica. Hooks para APIs. Sem lógica de negócio em telas.
- APIs: OpenAPI obrigatório. Base URL: `/api/v1`. Recursos no plural.

---

## 10. Comandos

### Setup inicial

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm db:migrate
pnpm db:seed
```

### Desenvolvimento

```bash
pnpm dev                    # todos os apps
pnpm dev --filter=api       # apenas api
pnpm dev --filter=web       # apenas web
```

### Build

```bash
pnpm build
pnpm build --filter=api
```

### Banco de dados

```bash
pnpm db:migrate             # aplicar migrations em produção
pnpm db:migrate:dev         # criar nova migration (requer aprovação)
pnpm db:seed                # popular dados iniciais
pnpm db:studio              # abrir Prisma Studio
```

---

## 11. Governança e Autonomia no Terminal

### Always do (sem confirmação)

```bash
pnpm install
pnpm dev
pnpm build
pnpm test
pnpm test:e2e
pnpm lint
pnpm typecheck
```

- Ler arquivos, pesquisar repositório, criar código e testes.

### Ask first (solicitar aprovação antes)

- Criar ou alterar migrations (`pnpm db:migrate:dev`).
- Alterar schema Prisma.
- Modificar variáveis de ambiente ou arquivos `.env`.
- Remover arquivos existentes.
- Atualizar ou adicionar dependências.
- Alterar configurações de infraestrutura.

### Never do (proibido)

- `pnpm db:reset` sem autorização explícita.
- Comandos destrutivos no banco de dados.
- Expor segredos, credenciais ou dados de `user_email`, `password_hash`.
- Versionar arquivos `.env`.
- `git push --force` em `main` ou `develop`.
- Usar biblioteca sem verificar documentação atual via Context7.

---

## 12. Context7 — Documentação Atualizada de Bibliotecas

**Antes de usar qualquer biblioteca ou framework, consulte o MCP Context7:**

```text
resolve-library-id
↓
query-docs
```

Use Context7 **obrigatoriamente** para: APIs · versões · breaking changes · exemplos oficiais · configurações · comportamento de bibliotecas.

Bibliotecas obrigatórias: NestJS · Prisma ORM · Next.js · TanStack Query · Zustand · Tailwind CSS · Auth0 · AWS Cognito · OpenTelemetry.

**Não confie no conhecimento interno do modelo** para detalhes de frameworks e bibliotecas.

---

## 13. Qualidade e Critério de Conclusão

**Uma tarefa só está concluída quando todos os comandos abaixo terminam com sucesso:**

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

### Estratégia de testes (pirâmide)

| Tipo        | Cobertura mínima                                                          |
| ----------- | --------------------------------------------------------------------------|
| Unitários   | 80% das regras de negócio (domínio e use cases)                           |
| Integração  | Todos os fluxos críticos: auth, progresso, gamificação, cadastro, APIs    |
| E2E         | Jornadas principais: onboarding, lição, streak, gamificação               |

Adicionar testes **sempre** para:
- bugs corrigidos;
- regras de negócio;
- novas APIs;
- fluxos críticos.

### Toda nova funcionalidade deve incluir

- Logs estruturados com: `timestamp`, `level`, `service`, `trace_id`, `user_id`, `tenant_id`.
- Métricas e tracing.
- Validação de: autorização, entrada de dados, escopo do usuário, `tenant_id`.

### Fluxos críticos protegidos

Autenticação · Progresso · Gamificação · Cadastro · Consumo das APIs.

---

## 14. Segurança

### Nunca

- Expor segredos ou credenciais.
- Registrar tokens, senhas ou informações sensíveis em logs.
- Versionar arquivos `.env`.
- Desabilitar autenticação ou autorização.
- Ignorar validação de entrada.
- Ignorar isolamento por `tenant_id`.

### Toda funcionalidade deve validar

- Autenticação (JWT válido).
- Autorização (RBAC: `USER` / `ADMIN` / `SUPER_ADMIN`).
- Escopo do usuário.
- Entrada de dados (sanitização + proteção contra SQL Injection, XSS, CSRF).
- `tenant_id` quando aplicável.

---

## 15. Documentação do Projeto

Consulte antes de implementar qualquer funcionalidade:

| Prioridade | Documento             | Caminho                      |
| ---------- | --------------------- | ---------------------------- |
| 1          | Arquitetura           | `docs/architecture.md`       |
| 2          | PRD                   | `docs/prd.md`                |
| 3          | Especificação Técnica | `docs/spec_tech.md`          |
| 4          | Especificação de UI   | `docs/spec_ui.md`            |
| 5          | Definição do Problema | `docs/definicao_problema.md` |
| 6          | Prompt de Design      | `docs/prompt_desenho.md`     |

---

## 16. Aprendizado Contínuo

Ao final de cada mudança significativa, reflita e responda:

1. O que funcionou bem e deveria virar regra permanente neste AGENTS.md?
2. Alguma regra existente está desatualizada ou incorreta?
3. Existe padrão recorrente que deveria ser documentado?
4. Há oportunidade de simplificação na arquitetura ou no código?

**Se existirem melhorias:** proponha um diff explícito do AGENTS.md e aguarde aprovação antes de alterar.
