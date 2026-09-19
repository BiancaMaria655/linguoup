---
marp: true
theme: default
paginate: true
backgroundColor: #ffffff
---

# 🚀 LinguoUp
**Transformando pequenos momentos do dia em oportunidades de aprendizado.**

Uma plataforma de aprendizado de idiomas baseada em microaprendizagem.

---
# ⚠️ O Problema

Aprender um idioma exige consistência. A barreira principal muitas vezes não é o acesso, mas sim a criação do **hábito**.

- **Falta de Tempo e Motivação**
- Milhões de adultos abandonam os estudos precocemente pela dificuldade de encaixar a prática na rotina diária ocupada.
- Como resultado, o potencial de bilinguismo global é desperdiçado pela alta taxa de desistência.

---
# 🎯 Público-Alvo e Objetivo

**👥 Quem são?**
Adultos (18-45 anos) com rotinas intensas de trabalho, estudo e compromissos pessoais, que desejam aprender um novo idioma mas falham em manter a consistência.

**💡 Nosso Objetivo**
Criar uma solução digital que **integre o aprendizado ao cotidiano** de forma:
- **Simples e Acessível**
- **Contínua** (Lições rápidas de 3 a 5 minutos)
- Focada em **aumentar a retenção, engajamento e adesão**

---
# 🏗️ Visão Arquitetural

A arquitetura escolhida para o MVP é um **Modular Monolith**, planejada para evoluir progressivamente para microsserviços.

**Por que Modular Monolith?**
Garante menor custo operacional e menor complexidade inicial, mas nasce pronta para escalar (Growth & Scale stages) com domínios bem definidos.

**Princípios Base:**
- **Single Source of Truth**: Backend centraliza as regras de negócio; DB para transações; Redis para cache.
- **Isolamento Lógico**: Preparado para Multi-Tenant (tenant_id transitando em toda entidade principal).
- **Eficiência**: Carregamento de tela ≤ 2s, transações atômicas otimizadas e latência p95 ≤ 500ms.

---
# 🗺️ Arquitetura (MVP)

- **Client**: Web Client e Painel Admin em Next.js
- **Backend (EKS)**: Monólito Modular NestJS com Domínios (Auth, Users, Learning, Progress, Gamification)
- **Banco de Dados e Cache**: PostgreSQL 15+ e Redis 7+
- **Mídia e Estáticos**: AWS S3 e CloudFront (CDN)
- **Segurança IAM**: Auth0
- **Observabilidade**: OpenTelemetry, Loki, Prometheus e Grafana

---
# 💻 Stack Tecnológica: Aplicação

**🌐 Frontend Web (Next.js)**
- **Linguagem:** TypeScript
- **Framework Web:** Next.js (App Router)
- **Estilo & UI:** Tailwind CSS, Zustand (Estado UI global)
- **Data Fetching:** TanStack Query (Estado do Servidor)

**⚙️ Backend (NestJS)**
- **Linguagem & Runtime:** TypeScript / Node.js LTS
- **Framework:** NestJS (Clean Architecture / DDD leve)
- **ORM:** Prisma ORM

---
# 🔐 Dados, Infra e Observabilidade

**🗄️ Dados e Armazenamento**
- PostgreSQL 15+, Redis 7+, AWS S3 + CloudFront (CDN)

**🛡️ Infraestrutura & Segurança**
- **Infra:** AWS EKS (Kubernetes), Docker Compose (Local)
- **CI/CD:** GitHub Actions (Build → Testes → SAST → Deploy Staging → Prod) e Terraform
- **Segurança:** Auth0 (MVP), OAuth 2.1, OIDC, RBAC

**📊 Observabilidade**
- OpenTelemetry, Loki, Prometheus, Grafana, Sentry

---
# 🛤️ Roadmap Evolutivo

1. **V1 - MVP (Modular Monolith):** Validação de engajamento, monólito NestJS, Auth0.
2. **V2 - Growth Stage:** Extração do *Notification Service* e *Recommendation Engine* para microsserviços; Dashboard Avançado.
3. **V3 - Scale Stage (Microservices & IA):** Serviços distribuídos (Learning, Progress, Gamification) via eventos (Kafka). Motor de IA Conversacional avançada. Migração para AWS Cognito.
4. **V4 - Enterprise:** Certificações, foco corporativo B2B e isolamento de Multi-Tenant profundo por schema/banco.
