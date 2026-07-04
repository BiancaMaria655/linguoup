## ADDED Requirements

### Requirement: Splash Screen exibida na primeira visita da sessão
O sistema SHALL exibir uma animação de logo (INT-01) de ~1.5 segundos ao abrir o aplicativo pela primeira vez em uma sessão do navegador, antes de renderizar qualquer conteúdo.

#### Scenario: Splash Screen na primeira visita
- **WHEN** o usuário abre o aplicativo e não há entrada `splash_shown` no `sessionStorage`
- **THEN** o sistema exibe a Splash Screen com animação do logo por ~1.5s e depois remove

#### Scenario: Splash Screen não repete na mesma sessão
- **WHEN** o usuário navega para outra rota e volta para `/`
- **THEN** a Splash Screen não é exibida novamente (sessionStorage contém `splash_shown=true`)

### Requirement: Tela de Boas-vindas (/) redireciona usuário autenticado
O sistema SHALL redirecionar usuários autenticados com onboarding completo da rota raiz `/` diretamente para `/dashboard`.

#### Scenario: Usuário logado acessa a raiz
- **WHEN** um usuário com token válido e `onboardingCompleted = true` acessa `/`
- **THEN** o sistema redireciona para `/dashboard`

#### Scenario: Usuário logado sem onboarding acessa a raiz
- **WHEN** um usuário com token válido mas `onboardingCompleted = false` acessa `/`
- **THEN** o sistema redireciona para `/onboarding`

#### Scenario: Usuário não autenticado vê tela de boas-vindas
- **WHEN** um usuário sem token acessa `/`
- **THEN** o sistema exibe a tela INT-02 com CTAs "Começar agora" e "Já tenho conta"

### Requirement: Hooks de UI desacoplados da lógica de negócio nas telas de auth/onboarding
O sistema SHALL implementar cada tela com separação explícita: componente de UI puro + hook customizado com lógica de formulário e chamadas de API via TanStack Query.

**Hooks a criar:**
- `useLoginScreen`: gerencia form state, `useMutation` para login, redirect logic
- `useRegisterScreen`: gerencia form state, `useMutation` para register
- `useOnboardingScreen`: gerencia step state, `useMutation` para onboarding
- `useAssessmentScreen`: gerencia question state, `useQuery` para questões, `useMutation` para submit

#### Scenario: Hook useLoginScreen isola lógica
- **WHEN** o componente `LoginPage` é renderizado
- **THEN** todo estado de formulário, loading, erro e navegação vem de `useLoginScreen`, sem lógica inline no componente

#### Scenario: Hooks são testáveis individualmente
- **WHEN** `useLoginScreen` é testado com `renderHook` e `msw`
- **THEN** cobre: submit válido → redirect; credenciais inválidas → erro; loading state
