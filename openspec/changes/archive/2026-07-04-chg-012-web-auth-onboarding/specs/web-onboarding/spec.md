## ADDED Requirements

### Requirement: Usuário completa onboarding multi-step antes de acessar o conteúdo
O sistema SHALL guiar o novo usuário por 4 passos sequenciais (objetivo, idioma, disponibilidade, plano) para personalizar sua experiência antes de iniciar a avaliação.

**Endpoint de persistência:** `POST /api/v1/users/me/onboarding`
**Request:**
```json
{
  "learningGoal": "CAREER | TRAVEL | EXAM | CULTURE",
  "targetLanguage": "en | es | fr | de | it | jp",
  "dailyGoalMinutes": 5 | 10 | 15 | 20,
  "preferredStudyHour": 5..23
}
```
**Response (200):**
```json
{ "data": { "onboardingCompleted": true } }
```

#### Scenario: Progresso de passo bloqueado sem seleção
- **WHEN** o usuário está no passo "objetivo" ou "idioma" sem nenhuma seleção
- **THEN** o botão "Continuar" está desabilitado

#### Scenario: Navegação entre passos
- **WHEN** o usuário clica "Continuar" com seleção válida
- **THEN** o passo avança e a barra de progresso atualiza proporcionalmente

#### Scenario: Usuário volta ao passo anterior
- **WHEN** o usuário clica "Voltar" em qualquer passo diferente do primeiro
- **THEN** o passo retrocede preservando as seleções anteriores

#### Scenario: Criação do plano personalizado
- **WHEN** o usuário clica "Iniciar Avaliação" no passo "plano"
- **THEN** o sistema chama `POST /api/v1/users/me/onboarding`, atualiza `authStore` com `onboardingCompleted: true` e redireciona para `/assessment`

#### Scenario: Erro ao salvar plano
- **WHEN** a chamada de onboarding falha (rede ou API)
- **THEN** o sistema exibe mensagem de erro no passo "plano" sem navegar

#### Scenario: Usuário com onboarding completo acessa `/onboarding`
- **WHEN** um usuário autenticado com `onboardingCompleted = true` acessa `/onboarding`
- **THEN** o sistema redireciona para `/dashboard`

### Requirement: Barra de progresso reflete passo atual do onboarding
O sistema SHALL exibir uma barra de progresso superior indicando a proporção completada do fluxo de onboarding (1/4, 2/4, 3/4, 4/4).

#### Scenario: Barra no primeiro passo
- **WHEN** o usuário está no passo 1 (objetivo)
- **THEN** a barra de progresso exibe 25% de preenchimento

#### Scenario: Barra no último passo
- **WHEN** o usuário está no passo 4 (plano)
- **THEN** a barra de progresso exibe 100% de preenchimento
