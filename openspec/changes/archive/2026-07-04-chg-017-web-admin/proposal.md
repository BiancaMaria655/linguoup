# CHG-017 — Web Admin: Autenticação & Gestão de Conteúdo

## Versão do Roadmap
**V1 — MVP**

## Descrição
Implementação do painel administrativo web (Next.js App Router) para gestão de conteúdo: autenticação de admin, CRUD de lições, CRUD de trilhas e visualização básica de usuários. Usado internamente pela equipe de conteúdo e operações.

## Contexto
Dependências: CHG-004 (auth API — login com role `ADMIN`), CHG-006 (lessons API). Os protótipos de referência no Stitch (projeto `projects/13167686388520823014`):
- `d3450a179578450e99feaaaf9d382eaa` — **Web Admin** (1280×1024px)
- `bc7179efbca040a1b32b3200b768a0d5` — **Admin Dashboard / Revisões Desktop** (1280×944px)
- `88d4dcb398c248efa8ce3cb8ccfc1e9d` — **Login (Desktop)** (545×801px, hidden)

A web admin é um Next.js App Router com Tailwind CSS e TanStack Query.

## Escopo

### O que está incluído

**Autenticação Admin:**
- `/login` — tela de login (email + senha), apenas ADMIN/SUPER_ADMIN
- Redirecionamento para `/dashboard` após autenticação
- Route Guards: middleware Next.js para proteger rotas `/admin/*`

**Dashboard Admin (`/admin/dashboard`):**
- Cards de métricas básicas: total de usuários, total de lições, lições concluídas hoje
- Links rápidos para as seções de gestão

**Gestão de Lições (`/admin/lessons`):**
- Listagem paginada de lições (com filtro por nível e tema)
- Criação de nova lição (formulário: título, descrição, nível, tema, duração, conteúdo JSON)
- Edição de lição existente
- Desativação de lição (soft delete)

**Gestão de Conquistas (`/admin/achievements`):**
- Listagem de conquistas
- Criação e edição de conquistas (nome, descrição, critérios, XP)

**Telas de referência Stitch:**
- Login: "Login e Boas-vindas (Desktop)"
- Cadastro Admin: "Cadastro (Desktop)"

**Endpoints de admin (novos no backend — CHG-004/006 precisam de extensão):**
- `POST /api/v1/admin/lessons` (ADMIN)
- `PATCH /api/v1/admin/lessons/{id}` (ADMIN)
- `DELETE /api/v1/admin/lessons/{id}` (ADMIN — soft delete)
- `POST /api/v1/admin/achievements` (ADMIN)
- `PATCH /api/v1/admin/achievements/{id}` (ADMIN)
- `GET /api/v1/admin/metrics` (ADMIN — métricas básicas)

**Testes:**
- Unitários: componentes de formulário (validação)
- Integração: fluxo login admin → criar lição → verificar no catálogo

### Non-goals
- Relatórios analíticos avançados (V2)
- Gestão de usuários com ban/permissões (V2)
- Editor visual de conteúdo de lições (V2)
- Internacionalização do painel (V2)

## Tamanho, Complexidade e Risco
| Dimensão    | Avaliação | Justificativa |
|-------------|-----------|---------------|
| Tamanho     | Médio     | 5 páginas + CRUD + auth + extensão de API |
| Complexidade| Média     | Next.js App Router + middleware auth + formulários complexos |
| Risco       | Médio     | Admin tem acesso elevado; RBAC obrigatório em todos os endpoints |

## Plano de Verificação
```bash
pnpm dev --filter=web
pnpm test --filter=web
pnpm build --filter=web
# Testar: login como ADMIN → criar lição → verificar lição aparece no app mobile
# Testar: usuário USER não consegue acessar rotas /admin/*
# Verificar que soft delete não remove registros do banco (isActive: false)
```
