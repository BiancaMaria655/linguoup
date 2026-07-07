## ADDED Requirements

### Requirement: Hook useSettingsScreen encapsula lógica da tela de configurações
O sistema SHALL expor um hook `useSettingsScreen` em `apps/web/app/hooks/useSettingsScreen.ts` que encapsule: busca de preferências (`GET /users/me/settings`), estado do formulário local (`useState`), mutação de salvar (`PATCH /users/me`), e logout. O hook SHALL aceitar uma estratégia de fallback quando o endpoint `/users/me/settings` não estiver disponível.

#### Scenario: Hook inicializa formulário com dados da API
- **WHEN** a query `GET /users/me/settings` retorna dados
- **THEN** o estado do formulário local (name, dailyGoalMinutes, preferredStudyHour, notificationFrequency) é inicializado com os valores retornados

#### Scenario: Salvar configurações dispara PATCH e exibe confirmação
- **WHEN** `saveSettings()` é chamado com formulário válido
- **THEN** `PATCH /api/v1/users/me` é chamado com os campos do formulário, o cache de `["profile"]` e `["home"]` são invalidados, e `saved: true` é retornado por 3 segundos

#### Scenario: Erro ao salvar é exposto ao componente
- **WHEN** `PATCH /api/v1/users/me` retorna erro
- **THEN** `saveError` contém a mensagem de erro e `saved` permanece `false`

#### Scenario: Logout limpa autenticação e redireciona
- **WHEN** `logout()` é chamado
- **THEN** `clearAuth()` é executado e o usuário é redirecionado para `/`

### Requirement: Teste unitário cobre cenários críticos de useSettingsScreen
O sistema SHALL incluir testes unitários em `hooks/__tests__/useSettingsScreen.test.ts` cobrindo: inicialização do formulário, mutação de salvar com sucesso, e exposição de erro.

#### Scenario: Teste verifica inicialização do formulário
- **WHEN** os testes de `useSettingsScreen` são executados
- **THEN** o caso "inicializa formulário com dados da API" passa com sucesso

#### Scenario: Teste verifica mutação de salvar
- **WHEN** os testes de `useSettingsScreen` são executados
- **THEN** o caso "salvar configurações chama PATCH /users/me" passa com sucesso
