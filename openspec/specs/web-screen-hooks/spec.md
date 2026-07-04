# web-screen-hooks

## Purpose

Defines the requirements for custom screen-level data-fetching hooks used in the authenticated client area, ensuring separation of concerns between data logic and UI rendering.

## Requirements

### Requirement: Hooks de screen isolam lógica de fetch nas telas do cliente autenticado
O sistema SHALL implementar hooks customizados `useHomeData`, `useLessons` e `useTrailDetail` em `app/hooks/`, seguindo o mesmo padrão de `useLoginScreen`/`useOnboardingScreen`, para que os componentes de página contenham apenas renderização.

#### Scenario: useHomeData encapsula a query de dados do dashboard
- **WHEN** `DashboardPage` é renderizado
- **THEN** todo estado de loading, dados e erro vem de `useHomeData()`, sem `useQuery` inline no componente

#### Scenario: useLessons encapsula a query do catálogo filtrado
- **WHEN** `LessonsPage` é renderizado com um filtro de nível
- **THEN** todo estado de loading, lista de trilhas e erro vem de `useLessons(filter)`, sem `useQuery` inline no componente

#### Scenario: useTrailDetail encapsula a query do detalhe da trilha
- **WHEN** `TrailDetailPage` é renderizado com um id de trilha
- **THEN** todo estado de loading, dados da trilha e erro vem de `useTrailDetail(id)`, sem `useQuery` inline no componente

#### Scenario: useHomeData é testável individualmente com renderHook e MSW
- **WHEN** `useHomeData` é testado com `renderHook` e MSW mockando `/users/me/home`
- **THEN** os testes cobrem: retorno de dados com sucesso → propriedades corretas; estado de loading inicial; erro da API → `isError: true`

#### Scenario: E2E cobre jornada completa da área autenticada
- **WHEN** o teste E2E Playwright é executado com usuário autenticado
- **THEN** cobre sequencialmente: visualizar dashboard com dados → navegar para catálogo de trilhas → abrir detalhe de uma trilha
