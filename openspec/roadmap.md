# Roadmap de Implementação — LinguoUp

> Planejamento incremental de mudanças para o desenvolvimento full stack da plataforma LinguoUp.
> Cada mudança tem tamanho, complexidade e risco ≤ médio.
> Autenticação está no topo da ordem de implementação (CHG-004 → CHG-012).

---

## ⭐ Início obrigatório — Autenticação

A autenticação é o primeiro fluxo crítico de produto. Sem ela nenhuma tela ou dado
de usuário pode existir. A sequência de início é:

```
CHG-001 (monorepo) → CHG-003 (database) → CHG-004 (API auth) → CHG-012 (web auth + onboarding)
```

---

## Visão Geral

```
FASE 1 — FUNDAÇÃO TÉCNICA (CHG-001 a CHG-003)
    ↓
FASE 2 — BACKEND MVP (CHG-004 ⭐ AUTH → CHG-005 → CHG-006 → CHG-007 → CHG-008 → CHG-009 → CHG-010)
    ↓
FASE 3 — DESIGN SYSTEM + WEB CLIENT (CHG-011 → CHG-012 ⭐ AUTH → CHG-013 → CHG-014 → CHG-015 → CHG-016)
    ↓
FASE 4 — WEB ADMIN MVP (CHG-017)
```

---

## Mapa de Dependências

```
CHG-001 (monorepo)
    ├── CHG-002 (CI/CD)
    ├── CHG-003 (database schema)
    │       └── CHG-004 ⭐ (auth API)
    │               └── CHG-005 (users/onboarding API)
    │                       └── CHG-006 (lessons API)
    │                               ├── CHG-007 (progress/streak)
    │                               ├── CHG-008 (gamification)
    │                               ├── CHG-009 (reviews/SM-2)
    │                               └── CHG-010 (notifications) ← CHG-005
    │
    └── CHG-011 (design system)
            ├── CHG-012 ⭐ (web: auth/onboarding) ← CHG-004/005/006
            │       └── CHG-013 (web: home) ← CHG-006/007/008
            │               ├── CHG-014 (web: lição) ← CHG-006/008
            │               ├── CHG-015 (web: progresso) ← CHG-007/008/009
            │               └── CHG-016 (web: perfil) ← CHG-005/010
            └── CHG-017 (web admin) ← CHG-004/006
```

---

## Mudanças por Fase

### Fase 1 — Fundação Técnica

| ID | Mudança | Tamanho | Complexidade | Risco | Proposta |
|----|---------|---------|--------------|-------|----------|
| CHG-001 | Monorepo Setup & Infraestrutura Base | Médio | Baixa | Baixo | [proposal.md](changes/chg-001-monorepo-setup/proposal.md) |
| CHG-002 | CI/CD Pipeline & Docker Base | Médio | Média | Baixo | [proposal.md](changes/chg-002-cicd-pipeline/proposal.md) |
| CHG-003 | Schema de Banco de Dados & Prisma Setup | Médio | Média | Médio | [proposal.md](changes/chg-003-database-schema/proposal.md) |

**Entregável:** Monorepo rodando localmente, pipeline de CI, schema do banco definido.

---

### Fase 2 — Backend V1 (API MVP)

> CHG-004 é obrigatoriamente o primeiro domínio de negócio implementado.

| ID | Mudança | Tamanho | Complexidade | Risco | Proposta |
|----|---------|---------|--------------|-------|----------|
| CHG-004 ⭐ | **API: Autenticação (Auth Domain)** | Médio | Média | Médio | [proposal.md](changes/chg-004-api-auth/proposal.md) |
| CHG-005 | API: Usuários & Onboarding | Médio | Baixa | Baixo | [proposal.md](changes/chg-005-api-users-onboarding/proposal.md) |
| CHG-006 | API: Lições & Trilhas (Learning Domain) | Médio | Média | Médio | [proposal.md](changes/chg-006-api-lessons/proposal.md) |
| CHG-007 | API: Progresso & Streak | Baixo/Médio | Baixa | Baixo | [proposal.md](changes/chg-007-api-progress-streak/proposal.md) |
| CHG-008 | API: Gamificação | Médio | Baixa/Média | Baixo | [proposal.md](changes/chg-008-api-gamification/proposal.md) |
| CHG-009 | API: Revisões & Repetição Espaçada (SM-2) | Baixo/Médio | Média | Baixo | [proposal.md](changes/chg-009-api-reviews/proposal.md) |
| CHG-010 | API: Notificações | Médio | Média | Médio | [proposal.md](changes/chg-010-api-notifications/proposal.md) |

**Entregável:** API backend completa. Testável via Swagger `/api/v1/docs`.

---

### Fase 3 — Design System & Web Client V1

> CHG-012 (auth/onboarding web) é implementado imediatamente após o Design System.

| ID | Mudança | Tamanho | Complexidade | Risco | Proposta |
|----|---------|---------|--------------|-------|----------|
| CHG-011 | Design System & Componentes Web | Médio | Baixa/Média | Baixo | [proposal.md](changes/chg-011-design-system/proposal.md) |
| CHG-012 ⭐ | **Web Client: Autenticação & Onboarding (INT-01 a INT-09)** | Médio | Média | Médio | [proposal.md](changes/chg-012-web-auth-onboarding/proposal.md) |
| CHG-013 | Web Client: Home Dashboard & Navegação (INT-10, 11, 12) | Médio | Baixa/Média | Baixo | [proposal.md](changes/chg-013-web-home-dashboard/proposal.md) |
| CHG-014 | Web Client: Execução de Lição & Resultado (INT-13, 14) | Médio | Média | Médio | [proposal.md](changes/chg-014-web-lesson-execution/proposal.md) |
| CHG-015 | Web Client: Progresso, Streak, Revisões & Gamificação (INT-15 a 18) | Médio | Média | Baixo/Médio | [proposal.md](changes/chg-015-web-progress-reviews/proposal.md) |
| CHG-016 | Web Client: Perfil, Configurações & Notificações (INT-19 a 21) | Médio | Baixa/Média | Baixo | [proposal.md](changes/chg-016-web-profile-settings/proposal.md) |

**Entregável:** Portal do aluno web responsivo completo com todos os fluxos do MVP.

---

### Fase 4 — Web Admin V1

| ID | Mudança | Tamanho | Complexidade | Risco | Proposta |
|----|---------|---------|--------------|-------|----------|
| CHG-017 | Web Admin: Autenticação & Gestão de Conteúdo | Médio | Média | Médio | [proposal.md](changes/chg-017-web-admin/proposal.md) |

**Entregável:** Painel administrativo operacional.

---

## Protótipos Stitch — Mapeamento de Telas

> Projeto Stitch: **LinguoUp** (`projects/13167686388520823014`)
> Design System: **Premium Playful Learning** | Cor primária: `#4648d4` | Fonte: Nunito Sans

### Telas Web Client responsivas (Mobile 390px)

| Screen ID (Stitch) | Label / Tema | Interfaces Spec | Mudança |
|---|---|---|---|
| `366558076ad74978ab390dbfcebe3d1d` | Cadastro e Login | INT-03 | CHG-012 |
| `4c944ac3184740a7b161656e5f825a4e` | Objetivos e Idioma | INT-04, INT-05 | CHG-012 |
| `d2fec5bb7ae84108ac794d7209063f6c` | Disponibilidade e Plano Inicial | INT-06, INT-07 | CHG-012 |
| `8e7b4d201cab4e45b1c403f5fff095b2` | Home Dashboard | INT-10 | CHG-013 |
| `b09a4f66078b4f1db799d79f53fedb1e` | Microlição em Curso | INT-13 | CHG-014 |
| `47c6cf61dbd64036ac4f62208b1d46da` | Dashboard de Progresso | INT-18 | CHG-015 |
| `8463ee2535f4421d9a97c1ffa3061744` | Perfil e Conquistas | INT-16, INT-21 | CHG-015, CHG-016 |
| `8b7953df6d57444f9c5c1a756a078537` | Revisões (Repetição Espaçada) | INT-17 | CHG-015 |

### Telas Desktop / Web Admin (1280px)

| Screen ID (Stitch) | Label / Tema | Interfaces Spec | Mudança |
|---|---|---|---|
| `bc7179efbca040a1b32b3200b768a0d5` | Admin Dashboard / Revisões Desktop | — | CHG-017 |
| `d3450a179578450e99feaaaf9d382eaa` | Web Admin (gestão de conteúdo) | — | CHG-017 |
| `88d4dcb398c248efa8ce3cb8ccfc1e9d` | Login (Desktop) [hidden] | INT-03 admin | CHG-017 |

### Telas sem protótipo Stitch (implementar do zero com Design System)

| Interface (spec_ui.md) | Motivo | Mudança |
|---|---|---|
| INT-01 Splash Screen | Animação de logo — sem equivalente estático | CHG-012 |
| INT-02 Boas-vindas | Screen `ef5b80bf8...` disponível (hidden, links atualizados) | CHG-012 |
| INT-08 Avaliação de Nível | Fluxo de questionário — não prototipado | CHG-012 |
| INT-09 Resultado da Avaliação | Resultado de assessment — não prototipado | CHG-012 |
| INT-11 Catálogo de Trilhas | Lista — não prototipada | CHG-013 |
| INT-12 Detalhe da Trilha | Detalhe — não prototipado | CHG-013 |
| INT-14 Resultado da Lição | Feedback pós-lição — não prototipado | CHG-014 |
| INT-15 Streak e Metas | Calendário de atividades — não prototipado | CHG-015 |
| INT-19 Centro de Notificações | Lista — não prototipada | CHG-016 |
| INT-20 Configurações | Formulário — não prototipado | CHG-016 |

---

## Interfaces Gráficas por Mudança

| Interface (spec_ui.md) | Tela Stitch | Mudança |
|------------------------|-------------|---------|
| INT-01 Splash Screen | — (animação de logo) | CHG-012 |
| INT-02 Boas-vindas | `ef5b80bf8...` Boas-vindas (hidden) | CHG-012 |
| INT-03 Cadastro e Login | `366558076...` Cadastro e Login | CHG-012 |
| INT-04 Objetivo de Aprendizado | `4c944ac31...` Objetivos e Idioma | CHG-012 |
| INT-05 Idioma Desejado | `4c944ac31...` Objetivos e Idioma | CHG-012 |
| INT-06 Disponibilidade Diária | `d2fec5bb7...` Disponibilidade e Plano | CHG-012 |
| INT-07 Resultado do Plano Inicial | `d2fec5bb7...` Disponibilidade e Plano | CHG-012 |
| INT-08 Avaliação de Nível | — (questionário) | CHG-012 |
| INT-09 Resultado da Avaliação | — (resultado) | CHG-012 |
| INT-10 Home Dashboard | `8e7b4d201...` Home Dashboard | CHG-013 |
| INT-11 Catálogo de Trilhas | — | CHG-013 |
| INT-12 Detalhe da Trilha | — | CHG-013 |
| INT-13 Execução da Microlição | `b09a4f660...` Microlição em Curso | CHG-014 |
| INT-14 Resultado da Lição | — | CHG-014 |
| INT-15 Tela de Streak e Metas | — | CHG-015 |
| INT-16 Conquistas e Gamificação | `8463ee253...` Perfil e Conquistas | CHG-015 |
| INT-17 Revisões (Repetição Espaçada) | `8b7953df6...` Revisões | CHG-015 |
| INT-18 Dashboard de Progresso | `47c6cf61d...` Dashboard de Progresso | CHG-015 |
| INT-19 Centro de Notificações | — | CHG-016 |
| INT-20 Configurações | — | CHG-016 |
| INT-21 Perfil do Usuário | `8463ee253...` Perfil e Conquistas | CHG-016 |
| INT-22 Conversação com IA | — | **V3** |
| INT-23 Feedback da Conversação | — | **V3** |
| (Admin) Login Desktop | `88d4dcb39...` Login Desktop | CHG-017 |
| (Admin) Painel Gestão | `d3450a179...` Web Admin | CHG-017 |

---

## Requisitos Funcionais por Mudança

| RFN | Requisito | Backend | Web Client |
|-----|-----------|---------|------------|
| RFN-01 | Cadastro e Onboarding Personalizado | CHG-004 ⭐, CHG-005 | CHG-012 ⭐ |
| RFN-02 | Avaliação de Nível Inicial | CHG-006 | CHG-012 |
| RFN-03 | Microlições Diárias | CHG-006 | CHG-013, CHG-014 |
| RFN-04 | Sistema de Formação de Hábito (Streak) | CHG-007 | CHG-013, CHG-015 |
| RFN-05 | Notificações Inteligentes | CHG-010 | CHG-016 |
| RFN-06 | Repetição Espaçada | CHG-009 | CHG-015 |
| RFN-07 | Gamificação (XP, Conquistas, Níveis) | CHG-008 | CHG-015 |
| RFN-08 | Dashboard de Progresso | CHG-007 | CHG-015 |
| RFN-09 | Modo Offline | — | **V2** |
| RFN-10 | Conversação com IA | — | **V3** |

---

## Critério de Conclusão (Universal)

Toda mudança só está concluída quando:

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

Passa **sem erros** para todos os apps afetados pela mudança.

---

## Próximas Versões (fora do escopo V1)

### V2 — Growth Stage
- Persistência básica local de progresso
- Motor de repetição espaçada como serviço dedicado
- Serviço de notificações com fila (SQS/SNS + FCM)
- Novos idiomas de aprendizado
- Dashboard analítico avançado

### V3 — Scale Stage
- Conversação com IA (INT-22, INT-23) — serviço dedicado LLM
- Event-Driven Architecture com Apache Kafka
- Microservices: Learning, Progress, Gamification, AI
- Migração Auth0 → AWS Cognito

### V4 — Enterprise Stage
- Certificações de proficiência
- Planos corporativos (tenant isolation por schema)
- Integração com plataformas educacionais (LMS)
- Trilhas profissionais verticais
