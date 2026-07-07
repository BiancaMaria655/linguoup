# Web Admin Capability Spec

## Purpose

Gerencia a interface do portal do administrador, incluindo login administrativo, guards de rotas, dashboard de estatísticas e modais para gerenciamento de lições e conquistas.

---

## Requirements

### Requirement: Admin can log in to portal
O sistema SHALL exibir uma tela de login dedicada em `/login` contendo formulário de e-mail e senha. O sistema valida que a resposta da API contém o token de acesso e que o usuário tem role `ADMIN` ou `SUPER_ADMIN`. Em caso de sucesso, redireciona o usuário para `/admin/dashboard`.

#### Scenario: Admin login with valid credentials
- **WHEN** o administrador preenche e-mail e senha e submete o formulário
- **THEN** o sistema autentica via API, armazena o token no `authStore` e redireciona para `/admin/dashboard`

#### Scenario: Normal user tries to login on admin interface
- **WHEN** um usuário padrão (`role = USER`) realiza login na tela `/login`
- **THEN** o sistema conclui a autenticação, mas o redireciona automaticamente para `/dashboard` (portal do aluno) devido ao nível de privilégio insuficiente

---

### Requirement: Route guards protect admin routes
O sistema SHALL implementar um Middleware e verificações de rota Next.js para proteger qualquer rota sob o prefixo `/admin/*`. Se um usuário tentar acessar essas rotas sem token de autenticação, ele SHALL ser redirecionado para `/login`. Se o usuário possuir token mas role = `USER`, ele SHALL ser redirecionado para `/dashboard`.

#### Scenario: Unauthenticated visitor attempts to access dashboard
- **WHEN** um visitante sem token no `authStore` navega para `/admin/dashboard`
- **THEN** o sistema intercepta a navegação e o redireciona para `/login`

#### Scenario: Student attempts to access admin lessons page
- **WHEN** um aluno autenticado com role `USER` digita a URL `/admin/lessons` no navegador
- **THEN** o sistema intercepta o acesso e o redireciona para `/dashboard`

---

### Requirement: Admin dashboard displays statistics
O sistema SHALL exibir cards informativos no dashboard `/admin/dashboard` com dados de métricas obtidos da API: total de usuários do tenant (com indicativo de ativos hoje), total de lições do tenant (com indicativo de concluídas hoje) e total de conquistas cadastradas na plataforma.

#### Scenario: Loading dashboard data
- **WHEN** o painel administrativo carrega e a requisição está em andamento
- **THEN** o sistema exibe esqueletos de carregamento (skeletons) nos cards de métricas
- **WHEN** a requisição termina com sucesso
- **THEN** exibe os números formatados localmente (pt-BR)

---

### Requirement: Admin manages lessons through UI modal
O sistema SHALL exibir a listagem de lições em `/admin/lessons` com filtro por nível (Iniciante, Intermediário, Avançado e Todos). Ao clicar em "Nova Lição" ou "Editar", abre-se um modal contendo campos de: Título, Tópico, Nível, Duração (minutos) e Descrição. Ao clicar em "Desativar" em uma lição ativa, exibe-se uma confirmação em tela.

#### Scenario: Creating a new lesson via form
- **WHEN** o administrador abre o modal de criação, preenche todos os campos obrigatórios e clica em "Criar"
- **THEN** o sistema envia requisição `POST /api/v1/admin/lessons`, fecha o modal após sucesso e invalida o cache do catálogo atualizando a listagem

#### Scenario: Soft deleting a lesson via action link
- **WHEN** o administrador clica no botão "Desativar" de uma lição ativa e confirma o aviso do navegador
- **THEN** o sistema envia requisição `DELETE /api/v1/admin/lessons/{id}`, atualiza o status na listagem tornando-a inativa e oculta o link de desativação

---

### Requirement: Admin manages achievements through UI modal
O sistema SHALL exibir a listagem de conquistas em `/admin/achievements`. Ao clicar em "+ Nova Conquista" ou "Editar", abre-se um modal contendo campos de: Nome, Descrição, URL do Ícone, Recompensa em XP e Critério de Desbloqueio (tipo e valor limite).

#### Scenario: Creating an achievement via form
- **WHEN** o administrador abre o formulário de conquista, preenche os campos com critério de desbloqueio e submete
- **THEN** o sistema envia a requisição `POST /api/v1/admin/achievements`, fecha o modal em caso de sucesso e recarrega a tabela de conquistas
