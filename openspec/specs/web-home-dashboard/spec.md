# web-home-dashboard

## Purpose

Defines the requirements for the Home Dashboard screen (`/dashboard`) displayed to authenticated users, including progress data visualization, personalized greetings, and smart recommendations.

## Requirements

### Requirement: Home Dashboard exibe dados de progresso do usuário autenticado
O sistema SHALL exibir na rota `/dashboard` a saudação personalizada, streak, XP total, nível, barra de progresso da meta diária, card de próxima lição recomendada e contador de revisões pendentes, consumindo os dados via hook `useHomeData`.

#### Scenario: Dashboard carregado com sucesso
- **WHEN** o usuário autenticado acessa `/dashboard` e a API `/users/me/home` retorna dados
- **THEN** o sistema exibe saudação com o primeiro nome do usuário, streak em dias, XP total, nível atual, porcentagem de progresso da meta diária, card com título e tópico da próxima lição, e contador de revisões pendentes

#### Scenario: Dashboard em estado de loading
- **WHEN** o usuário autenticado acessa `/dashboard` e a resposta da API ainda não chegou
- **THEN** o sistema exibe skeletons nos campos de streak, XP, nível e no card de próxima lição em lugar dos dados reais

#### Scenario: Saudação varia por horário do dia
- **WHEN** o usuário acessa o dashboard em horário matutino (antes das 12h)
- **THEN** a saudação exibe "Bom dia, [primeiro nome]"
- **WHEN** o usuário acessa em horário vespertino (12h–18h)
- **THEN** a saudação exibe "Boa tarde, [primeiro nome]"
- **WHEN** o usuário acessa em horário noturno (após 18h)
- **THEN** a saudação exibe "Boa noite, [primeiro nome]"

#### Scenario: Card de próxima lição não exibido quando não há lição recomendada
- **WHEN** a API retorna `nextLesson: null`
- **THEN** o card "Continuar de onde parou" não é renderizado

#### Scenario: Card de revisões pendentes não exibido quando não há revisões
- **WHEN** a API retorna `pendingReviews: 0`
- **THEN** o card "Revisões pendentes" não é renderizado
