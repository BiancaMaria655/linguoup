---
marp: true
theme: default
paginate: true
backgroundColor: #fcfcfc
style: |
  section {
    font-size: 26px;
    padding: 40px 60px;
  }
  h1 {
    color: #2b6cb0;
    font-size: 42px;
  }
  h2 {
    color: #2d3748;
    font-size: 32px;
  }
  li {
    margin-bottom: 10px;
  }
---

# 🚀 LinguoUp: Apresentação Executiva
**Transformando pequenos momentos do dia em oportunidades reais de aprendizado.**

Uma plataforma de aprendizado de idiomas baseada em microaprendizagem, gamificação e retenção de hábitos.

---
# ⚠️ 1. O Problema

Aprender um novo idioma é o desejo de milhões de pessoas para alavancar carreiras e experiências, porém a barreira principal não é o acesso ao conteúdo, mas a **formação de um hábito consistente**.

- **Falta de Tempo e Motivação:** Cursos tradicionais exigem longos blocos de estudo.
- **Rotinas Imprevisíveis:** Adultos possuem dificuldades em encontrar horas livres no dia a dia ocupado.
- **Alta Desistência:** O aprendizado sem a percepção de evolução rápida ou adaptação à rotina resulta no abandono precoce antes da fluência.

---
# 💡 2. A Solução e Diferenciais

O LinguoUp é uma solução digital que se **integra ao cotidiano** do usuário, sem exigir grandes compromissos de tempo diário.

**Nossos Diferenciais:**
- **Microlições:** Sessões curtas de apenas **3 a 5 minutos**.
- **Aprendizado Adaptável:** Conteúdo que se ajusta aos objetivos e disponibilidade.
- **Formação de Hábito:** Gamificação, repetição espaçada e manutenção de *streaks*.
- **Prática Contextual:** Situações focadas no dia a dia do usuário.
- **Inteligência Artificial:** Motor de IA que sugere revisões e, em versões futuras, simula conversas reais.

---
# 👥 3. Perfis de Usuário (Personas)

**1. O Profissional Ocupado (25-45 anos)**
- Busca crescimento na carreira e viagens internacionais. 
- Sofre com rotina imprevisível e abandona cursos tradicionais longos. 

**2. O Universitário (18-30 anos)**
- Busca intercâmbio e certificações de proficiência. 
- Tem dificuldade de conciliar os estudos da faculdade com o estudo do idioma.

**3. O Aprendiz Casual**
- Aprende por hobby, para consumir filmes e músicas. 
- Sofre com baixa motivação a longo prazo sem metas claras.

---
# 🗺️ 4. A Jornada do Usuário

- **Onboarding Personalizado:** O usuário se cadastra em <3 mins, define sua disponibilidade diária, e o sistema sugere metas.
- **Avaliação Inicial de Nivelamento (≤ 10 mins):** Coloca o aluno imediatamente no nível adequado de sua trilha.
- **O Dashboard (Home):** Focado na ação imediata — Saudação, meta diária, streak, revisão espaçada e a próxima lição em destaque.
- **A Lição:** Dinâmica, focada, durando de 3 a 5 minutos, recompensando o usuário imediatamente ao final com *XP* e atualizações do *Streak*.

---
# 🎮 5. UX e Formação de Hábito

O aplicativo adota princípios agressivos de redução de fricção e engajamento:

- **Redução de Atrito:** Apenas **3 toques/cliques** no máximo para iniciar uma lição da Home.
- **Gamificação Contínua:** Recompensas instantâneas (XP), Sistema de Conquistas e visualização clara do Streak (frequência ininterrupta).
- **Repetição Espaçada:** Uma fila inteligente de revisões diárias otimiza a retenção do vocabulário que o usuário está prestes a esquecer.
- **Notificações Inteligentes:** Alertas enviados nos horários em que o usuário tem maior probabilidade de estar ativo.

---
# 🏗️ 6. Visão Arquitetural

A arquitetura inicia como um **Modular Monolith** focado em acelerar o *Time-to-Market*, mas com organização orientada a domínios que prepara o projeto para uma escala Enterprise baseada em Microsserviços.

- **Single Source of Truth:** O Backend (NestJS) encapsula totalmente a regra de negócio. O Frontend atua puramente na renderização e estado visual.
- **Domínios Fechados:** Autenticação, Usuários, Aprendizado, Progresso, Gamificação e Notificações vivem em módulos isolados.
- **Performance (SLOs):** 
  - Carregamento de tela (Web): **≤ 2 segundos**
  - Latência p95 de API: **≤ 500ms**
  - Disponibilidade de serviço: **≥ 99,5% mensal**

---
# 🌐 7. Topologia na Nuvem (AWS MVP)

**Frontend:** Web App e Admin distribuídos pelo CloudFront CDN.
**Backend:** Cluster EKS rodando o monólito NestJS.

**Integrações de Dados:**
- **PostgreSQL (RDS):** Persistência relacional transacional.
- **Redis (ElastiCache):** Gerenciamento de estado de sessões, leaderboards em tempo real e cache-aside para lições.
- **S3:** Armazenamento de áudios, imagens e arquivos multimídia offline.

---
# 💻 8. Stack Tecnológica Completa

### 🌐 Frontend (Aplicação do Usuário e Administrativa)
- **Framework & Linguagem:** Next.js (App Router) + TypeScript
- **State Management:** Zustand (UI local) + TanStack Query (Estado de API / Server state offline-first)
- **Estilo:** Tailwind CSS

### ⚙️ Backend (APIs)
- **Framework & Linguagem:** NestJS + TypeScript (Node LTS)
- **Design Pattern:** Clean Architecture e DDD Leve
- **ORM e Banco:** Prisma ORM conectando ao PostgreSQL 15+

---
# 🛡️ 9. Segurança, Identidade e Conformidade

- **Gestão de Identidade:** Auth0 (MVP), utilizando OAuth 2.1, OIDC, Access e Refresh Tokens rotativos HTTP-only.
- **RBAC (Controle de Acesso):** Isolamento de rotas para `USER`, `ADMIN` e `SUPER_ADMIN`.
- **Prevenção (OWASP):** Rate limiting e proteções inerentes nos frameworks contra XSS, CSRF, SSRF e SQL Injection.
- **LGPD:** Dados criptografados em repouso e trânsito, com políticas claras de direito ao esquecimento e desativação.

---
# 📊 10. Operações e Observabilidade

Para monitorar e sustentar o produto, a telemetria é abrangente desde o primeiro dia:

- **Logs & Tracing:** Instrumentação OTLP via **OpenTelemetry**; Logs estruturados processados pelo **Loki** e **Grafana**.
- **Métricas:** Indicadores de performance consumidos via **Prometheus**.
- **DevSecOps:** Pipeline robusto via **GitHub Actions** 
  - Lint → Typecheck → Unit/E2E Tests → SAST (SonarQube) → Trivy/Dependabot → Implantação Blue-Green.

---
# 🛤️ 11. Roadmap de Evolução Arquitetural

* **V1: O MVP (Atual)**
  * Monólito NestJS; Repetição espaçada embutida, IAM no Auth0. Objetivo: Validar retenção.
* **V2: O Growth Stage**
  * Extração do Motor de Recomendação e Serviços de Notificação. Expansão para múltiplos idiomas.
* **V3: Scale Stage (IA & Microservices)**
  * Break-down em microsserviços (Learning, Gamification). Eventos via **Kafka**.
  * **Motor de IA Conversacional**: Simulação de diálogos, avaliações vocais avançadas.
* **V4: Enterprise Stage**
  * Separação de Tenants no nível de banco/schema, painel corporativo e certificações B2B.

---
# 📈 12. Métricas de Sucesso de Negócio

- **Aquisição:** Custo por Usuário Adquirido (CAC); Taxa de conversão do fluxo de onboarding.
- **Engajamento:** Daily Active Users (DAU); Tempo médio diário; Lições por dia.
- **Retenção:** Retenção em D1, D7 e D30; % de usuários mantendo longos streaks.
- **Receita (Modelos V2/V3):** Monthly Recurring Revenue (MRR); Lifetime Value (LTV) versus CAC.

---
# 🚀 Fim da Apresentação
**LinguoUp: Menos tempo livre demandado, muito mais resultado.**
