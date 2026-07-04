## ADDED Requirements

### Requirement: Hook useProfileScreen encapsula lógica da tela de perfil
O sistema SHALL expor um hook `useProfileScreen` em `apps/web/app/hooks/useProfileScreen.ts` que encapsule: busca de perfil (`GET /users/me`), busca de XP (`GET /xp`), busca de conquistas (`GET /achievements/me`), mutação de edição de nome (`PATCH /users/me`), e logout. O hook SHALL retornar estado de UI (modal de edição aberto/fechado, nome editado, erro) e handlers (abrir modal, fechar modal, salvar nome, logout).

#### Scenario: Hook retorna dados de perfil quando autenticado
- **WHEN** o hook é montado com `accessToken` válido no store
- **THEN** as queries `["profile"]`, `["xp"]` e `["achievements"]` são disparadas via TanStack Query

#### Scenario: Edição de nome dispara PATCH e invalida cache
- **WHEN** `saveName(novoNome)` é chamado
- **THEN** `PATCH /api/v1/users/me` é chamado com body `{ name: novoNome }`, o cache de `["profile"]` é invalidado e o modal é fechado

#### Scenario: Logout limpa autenticação e redireciona
- **WHEN** `logout()` é chamado
- **THEN** `clearAuth()` é executado e o usuário é redirecionado para `/`

### Requirement: Página de Perfil consome useProfileScreen
O `ProfilePage` SHALL ser refatorado para consumir apenas `useProfileScreen`, removendo lógica inline de queries e mutations.

#### Scenario: Página renderiza dados do hook
- **WHEN** `ProfilePage` é renderizado
- **THEN** todos os dados (nome, email, XP, streak, conquistas) são obtidos exclusivamente via `useProfileScreen`
