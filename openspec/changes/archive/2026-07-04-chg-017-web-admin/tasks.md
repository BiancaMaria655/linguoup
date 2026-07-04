## 1. Database Schema Update

- [x] 1.1 Adicionar o campo `isActive` com valor padrão `true` ao model `Lesson` em `schema.prisma`. Rollback: reverter o arquivo de schema e executar nova migrate. Validação: `pnpm prisma format`.
- [x] 1.2 Gerar e aplicar a migração de desenvolvimento utilizando `pnpm db:migrate:dev --name add-lesson-is-active`. Rollback: executar SQL manualmente para dropar a coluna `isActive` da tabela `Lesson` e apagar a pasta da migração criada. Validação: `pnpm lint && pnpm typecheck && pnpm build`.

## 2. Backend Admin API Endpoints

- [x] 2.1 Modificar o `LessonRepository` do portal do aluno para filtrar apenas lições onde `isActive` é `true` nas buscas `findAll` e `findById`. Validação: `pnpm test --filter=api`.
- [x] 2.2 Desenvolver o `AdminLessonsController` (`/api/v1/admin/lessons`) com suporte a GET (listagem com role check), POST (criação), PATCH (atualização) e DELETE (soft delete definindo `isActive = false`). Validação: `pnpm lint && pnpm typecheck && pnpm test --filter=api`.
- [x] 2.3 Adicionar invalidação do cache do catálogo de lições (`lessons:catalog:*`) no Redis nas operações de mutação (criação, edição e desativação). Validação: `pnpm test --filter=api`.
- [x] 2.4 Desenvolver o `AdminAchievementsController` (`/api/v1/admin/achievements`) com suporte a POST e PATCH para criação e edição de conquistas da plataforma. Validação: `pnpm lint && pnpm typecheck && pnpm test --filter=api`.
- [x] 2.5 Adicionar invalidação do cache global de conquistas (`achievements:catalog`) no Redis nas operações de mutação. Validação: `pnpm test --filter=api`.
- [x] 2.6 Criar o endpoint `GET /api/v1/admin/metrics` compilando dados agregados por `tenant_id` (total de usuários, ativos hoje, total de lições, conclusões hoje). Validação: `pnpm test --filter=api`.

## 3. Frontend Route Protection and Web UI Integration

- [x] 3.1 Desenvolver o arquivo de middleware do Next.js `apps/web/middleware.ts` para interceptar acessos a `/admin/*` e realizar o redirecionamento baseado em autenticação e role. Validação: `pnpm build --filter=web`.
- [x] 3.2 Atualizar o fluxo da página `/login` para verificar a role do usuário no JWT e redirecionar adequadamente para `/admin/dashboard` ou `/dashboard`. Validação: `pnpm lint && pnpm typecheck --filter=web`.
- [x] 3.3 Integrar o dashboard administrativo em `/admin/dashboard` com a API de métricas, adicionando skeletons de carregamento. Validação: `pnpm build --filter=web`.
- [x] 3.4 Conectar a interface de gerenciamento de lições `/admin/lessons` com a API administrativa utilizando React Query, incluindo modais de cadastro/edição e confirmação de desativação. Validação: `pnpm build --filter=web`.
- [x] 3.5 Conectar a interface de conquistas em `/admin/achievements` com a API de conquistas globais para fluxo completo de criação e edição. Validação: `pnpm build --filter=web`.

## 4. Testing and Verification

- [x] 4.1 Escrever testes unitários para os novos controllers e use cases de admin no NestJS. Validação: `pnpm test --filter=api`.
- [x] 4.2 Escrever testes de integração cobrindo o fluxo crítico (login como admin -> criar lição -> catálogo do estudante exclui inativas). Validação: `pnpm test`.
- [x] 4.3 Executar verificação geral de integridade do monorepo. Validação: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.
