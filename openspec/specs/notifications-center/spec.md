# notifications-center

## Purpose

Define os requisitos para o centro de notificações da plataforma, englobando o hook `useNotificationsScreen` (para busca, marcação de lida unitária/em massa e contagem de não lidas), a exibição do badge de notificações não lidas no menu de navegação, e os testes unitários e E2E associados.

## Requirements

### Requirement: Hook useNotificationsScreen encapsula lógica do centro de notificações
O sistema SHALL expor um hook `useNotificationsScreen` em `apps/web/app/hooks/useNotificationsScreen.ts` que encapsule: busca de notificações (`GET /notifications`), mutação de marcar uma como lida (`PATCH /notifications/:id/read`), mutação de marcar todas como lidas (`PATCH /notifications/read-all`), e cálculo de `unreadCount`.

#### Scenario: Hook retorna lista de notificações e contagem de não lidas
- **WHEN** a query `GET /notifications` retorna dados
- **THEN** `notifications` contém a lista completa e `unreadCount` contém o número de itens com `read: false`

#### Scenario: Marcar notificação como lida invalida o cache
- **WHEN** `markRead(id)` é chamado com um id válido
- **THEN** `PATCH /api/v1/notifications/:id/read` é chamado e o cache de `["notifications"]` é invalidado

#### Scenario: Marcar todas como lidas invalida o cache
- **WHEN** `markAllRead()` é chamado
- **THEN** `PATCH /api/v1/notifications/read-all` é chamado e o cache de `["notifications"]` é invalidado

---

### Requirement: Badge de notificações não lidas no layout de navegação
O sistema SHALL exibir um badge numérico no item de navegação do Perfil (ou em um ícone de sino dedicado) quando `unreadCount > 0`. O badge SHALL usar a query key `["notifications"]` já existente para evitar requisição adicional.

#### Scenario: Badge exibido quando há notificações não lidas
- **WHEN** `GET /notifications` retorna itens com `read: false`
- **THEN** um badge com a contagem de não lidas é exibido visivelmente no layout de navegação

#### Scenario: Badge oculto quando todas as notificações estão lidas
- **WHEN** `GET /notifications` retorna todos os itens com `read: true`
- **THEN** nenhum badge é exibido no layout de navegação

---

### Requirement: Testes unitários cobrem cenários críticos de useNotificationsScreen
O sistema SHALL incluir testes unitários em `hooks/__tests__/useNotificationsScreen.test.ts` cobrindo: listagem com contagem de não lidas, marcar uma como lida, e marcar todas como lidas.

#### Scenario: Teste verifica contagem de não lidas
- **WHEN** os testes de `useNotificationsScreen` são executados
- **THEN** o caso "unreadCount reflete notificações com read: false" passa com sucesso

#### Scenario: Teste verifica mutação de marcar lida
- **WHEN** os testes de `useNotificationsScreen` são executados
- **THEN** o caso "markRead chama PATCH /notifications/:id/read" passa com sucesso

---

### Requirement: Teste E2E cobre jornada de edição de nome no perfil
O sistema SHALL incluir um teste E2E com Playwright em `apps/web/e2e/` cobrindo a jornada: autenticar → abrir perfil → clicar em editar nome → inserir novo nome → salvar → verificar nome atualizado na tela.

#### Scenario: Jornada de edição de nome completa
- **WHEN** o teste E2E de perfil é executado
- **THEN** o fluxo completo de editar nome passa sem erros, verificando que o nome atualizado é exibido após salvar
