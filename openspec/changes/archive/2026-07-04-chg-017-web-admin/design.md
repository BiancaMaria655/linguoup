## Context

O sistema LinguoUp necessita de um painel administrativo seguro para gerenciamento de conteúdo por parte da equipe de operações. O portal administrativo foi parcialmente estruturado em Next.js (App Router) em `apps/web/app/admin`, porém carece de autenticação e proteção robusta de rotas, integração com APIs administrativas no backend, tratamento de soft delete nas lições, e persistência das conquistas. A stack backend utiliza NestJS com Prisma ORM (banco de dados PostgreSQL) e cacheamento Redis.

## Goals / Non-Goals

**Goals:**
* Implementar a proteção de rotas no Next.js (middleware/route guards) para que apenas usuários autenticados com role `ADMIN` ou `SUPER_ADMIN` possam acessar `/admin/*`.
* Estender o banco de dados via Prisma ORM para suportar soft delete nas lições, adicionando o campo `isActive` ao model `Lesson`.
* Desenvolver endpoints administrativos no backend NestJS para CRUD de lições, criação/edição de conquistas e métricas do painel, garantindo validação de token JWT, nível de RBAC exigido (`ADMIN`/`SUPER_ADMIN`) e isolamento por `tenant_id`.
* Integrar as telas do frontend (`/admin/lessons`, `/admin/achievements`, `/admin/dashboard`) com a API real, garantindo invalidação do cache Redis no backend ao sofrer mutações de conteúdo.

**Non-Goals:**
* Gestão avançada de usuários, permissões granulares adicionais ou banimento de contas (V2).
* Relatórios de analytics complexos no dashboard (V2).
* Internacionalização (i18n) do painel de administração (V2).
* Criação de um editor visual de exercícios interativos ricos na criação de lições (V2).

## Decisions

### 1. Extensão do Schema Prisma (Model Lesson)
* **Decisão:** Adicionar o campo `isActive Boolean @default(true)` ao modelo `Lesson` no arquivo `schema.prisma`.
* **Racional:** Para suportar a funcionalidade de soft delete das lições conforme solicitado (Desativação de lição), sem violar chaves estrangeiras de tabelas de histórico (`LessonCompletion`, `SpacedReviewItem`).
* **Alternativas consideradas:** Hard delete (não viável devido ao histórico de progresso dos alunos) ou tabela separada para lições arquivadas (complexidade desnecessária para o volume atual de dados).

### 2. Criação de Controllers Dedicados a Admin no Backend
* **Decisão:** Criar controllers e casos de uso separados para operações administrativas no NestJS, e.g., `AdminLessonsController`, `AdminAchievementsController`, e `AdminMetricsController` mapeados sob a rota `/api/v1/admin/*`.
* **Racional:** Separação de conceitos clara. Proteção global nos controllers usando `@UseGuards(JwtAuthGuard, RolesGuard)` e `@Roles(Role.ADMIN, Role.SUPER_ADMIN)` minimiza o risco de exposição acidental de endpoints privilegiados aos usuários padrão.
* **Alternativas consideradas:** Misturar endpoints de admin nos controllers existentes dos alunos (`LessonsController`). Aumenta a complexidade de manutenção e risco de falhas de segurança por falta de anotações corretas de guardas.

### 3. Invalidação de Cache Baseada em Padrão (Redis)
* **Decisão:** Realizar a invalidação do cache do catálogo de lições removendo as chaves do Redis que iniciam com o padrão `lessons:catalog:*` quando houver criação, edição ou desativação de lições.
* **Racional:** Evita que os alunos recebam dados desatualizados por até 1h (TTL). Como a listagem possui múltiplos parâmetros de filtros e cursores dinâmicos gerando chaves distintas, a invalidação do padrão é a abordagem mais robusta.
* **Alternativas consideradas:** Aguardar expiração natural do TTL (UX ruim pois o administrador não veria a atualização refletida de imediato para os alunos).

### 4. Proteção de Rotas no Frontend (Next.js Middleware)
* **Decisão:** Adicionar um arquivo de middleware no Next.js (`apps/web/middleware.ts`) que intercepta requisições para `/admin/*` e redireciona usuários não autenticados ou com roles não administrativas para `/login` ou `/dashboard`.
* **Racional:** Segurança em camadas. Evita renderização desnecessária e melhora a experiência de usuário impedindo o acesso visual às páginas administrativas. Complementa o guard do layout do admin.
* **Alternativas consideradas:** Depender exclusivamente de verificação client-side no `useEffect` do layout. Pode apresentar "flickering" visual (exibição momentânea da tela antes do redirecionamento).

## Risks / Trade-offs

* **[Risk]** Lições desativadas (soft delete) continuarem sendo exibidas no portal do aluno.
  * **Mitigação:** Modificar o repositório de lições dos alunos (`LessonRepository.findAll`) para filtrar por `isActive: true` por padrão.
* **[Risk]** Execução de `prisma db migrate:dev` gerar inconsistência no banco de desenvolvimento.
  * **Mitigação:** Executar o comando no ambiente dev de maneira segura após aprovação do usuário, certificando-se de que o valor default (`true`) seja aplicado a todos os registros existentes.
* **[Risk]** Perda de performance no Redis por varredura de chaves.
  * **Mitigação:** Utilizar comandos otimizados de deleção e, como o escopo do projeto é controlado, o volume de chaves é reduzido.
