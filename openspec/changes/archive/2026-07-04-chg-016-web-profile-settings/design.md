## Context

As telas de **Perfil** (`/profile`), **Configurações** (`/settings`) e **Centro de Notificações** (`/notifications`) já existem como `page.tsx` autossuficientes no Next.js App Router. Toda lógica de queries, mutations e estado local está embutida diretamente nos componentes de página — sem hooks extraídos, sem testes unitários, sem badge de não lidas no nav.

O objetivo desta mudança é:
1. Extrair a lógica de cada tela para hooks dedicados (`useProfileScreen`, `useSettingsScreen`, `useNotificationsScreen`), seguindo o padrão já estabelecido pelos demais hooks do projeto (`useStreakScreen`, `useLoginScreen`, etc.).
2. Adicionar badge de notificações não lidas no layout de navegação (`(client)/layout.tsx`).
3. Cobrir os hooks com testes unitários.
4. Adicionar teste E2E para a jornada de edição de nome.

Dependências já satisfeitas: CHG-005 (API `/users/me`), CHG-010 (API `/notifications`), CHG-011 (design system tokens), CHG-013 (navegação + layout).

## Goals / Non-Goals

**Goals:**
- Extrair lógica de cada página para hooks testáveis.
- Expor `unreadCount` via `useNotificationsScreen` e consumir no layout para o badge.
- Testes unitários para `useSettingsScreen` (mutação de salvar preferências) e `useNotificationsScreen` (marcar lida / marcar todas como lidas).
- Teste E2E (Playwright): abrir perfil → editar nome → salvar → verificar nome atualizado.
- Verificar que o fluxo de logout limpa o token e redireciona para `/`.

**Non-Goals:**
- Upload de foto de perfil (V2 / S3).
- Dark mode / temas visuais (V2).
- Exclusão de conta (LGPD — V2).
- Login social na tela de configurações.
- Mudança de endpoints de API ou schema Prisma.

## Decisions

### 1. Hook por tela, não hook global de usuário

**Decisão**: criar três hooks individuais (`useProfileScreen`, `useSettingsScreen`, `useNotificationsScreen`) em vez de um único `useUserStore` ou hook genérico.

**Rationale**: O padrão do projeto já usa hooks por tela (ver `useStreakScreen`, `useReviewSession`). Um hook global de usuário criaria acoplamento entre telas distintas e não foi solicitado. Cada hook encapsula exatamente a lógica da tela correspondente.

**Alternativa descartada**: Zustand store de usuário — desnecessário para MVP, pois os dados já são gerenciados via TanStack Query com cache compartilhado por query key (`["profile"]`, `["notifications"]`).

### 2. Badge de notificações via query compartilhada no layout

**Decisão**: o `ClientLayout` chamará `useQuery` com `queryKey: ["notifications"]` apenas para obter o `unreadCount`. Mesma query key já usada por `NotificationsPage` — o TanStack Query deduplica a requisição.

**Alternativa descartada**: um endpoint separado `/notifications/count` — introduziria nova rota de API não prevista no escopo.

### 3. Configurações via PATCH `/users/me` (não `/users/me/settings`)

**Decisão**: manter o endpoint existente `PATCH /users/me` para salvar nome + preferências de aprendizado + frequência de notificação. A página de settings atual já faz isso corretamente.

**Observação**: a query de carregamento usa `GET /users/me/settings` (endpoint distinto). Isso já existe e não será alterado.

### 4. Testes unitários com vitest + @testing-library/react

**Decisão**: seguir o mesmo padrão dos testes existentes em `hooks/__tests__/` (ver `useStreakScreen.test.ts`). Mockar `apiFetch` e `useAuthStore` conforme o padrão estabelecido.

## Risks / Trade-offs

| Risco | Mitigação |
|-------|-----------|
| Badge de notificações dispara requisição extra no layout em toda navegação | TanStack Query deduplica se a query `["notifications"]` já estiver em cache; TTL padrão previne over-fetching |
| Hook de settings com `useEffect` para inicializar formulário pode causar re-renders duplos | Padrão já estabelecido em `SettingsPage` — aceito como trade-off de simplicidade no MVP |
| Teste E2E depende do servidor de API disponível | Usar `page.route()` do Playwright para interceptar chamadas API nos testes E2E se necessário |
