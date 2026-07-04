# web-auth

## Purpose

Especificação das funcionalidades de autenticação no portal web do aluno: registro, login, persistência de sessão e logout.

## Requirements

### Requirement: Usuário pode se registrar com e-mail e senha
O sistema SHALL permitir que um novo usuário crie uma conta fornecendo nome, e-mail e senha válidos através da tela INT-03 (Cadastro).

**Endpoint:** `POST /api/v1/auth/register`
**Request:**
```json
{ "name": "string (min 2)", "email": "string (email válido)", "password": "string (min 8 chars)" }
```
**Response (201):**
```json
{ "data": { "accessToken": "string (JWT)" } }
```
**Error (400/409):**
```json
{ "error": { "code": "VALIDATION_ERROR | EMAIL_ALREADY_EXISTS", "message": "string" } }
```

#### Scenario: Cadastro com dados válidos
- **WHEN** o usuário preenche nome, e-mail e senha válidos e clica em "Criar conta"
- **THEN** o sistema chama `POST /api/v1/auth/register`, salva o token no `authStore`, e redireciona para `/onboarding`

#### Scenario: Cadastro com e-mail já existente
- **WHEN** o usuário tenta se registrar com um e-mail já cadastrado
- **THEN** o sistema exibe mensagem de erro "E-mail já cadastrado" sem redirecionar

#### Scenario: Cadastro com senha fraca
- **WHEN** o usuário submete senha com menos de 8 caracteres
- **THEN** o sistema exibe erro de validação inline antes de chamar a API

#### Scenario: Feedback de carregamento durante cadastro
- **WHEN** a requisição de cadastro está em andamento
- **THEN** o botão "Criar conta" é desabilitado e exibe indicador de loading

---

### Requirement: Usuário pode fazer login com e-mail e senha
O sistema SHALL permitir que um usuário existente autentique-se via tela INT-03 (Login) e seja redirecionado conforme o estado do seu onboarding.

**Endpoint:** `POST /api/v1/auth/login`
**Request:**
```json
{ "email": "string", "password": "string" }
```
**Response (200):**
```json
{ "data": { "accessToken": "string (JWT)" } }
```
**Error (401):**
```json
{ "error": { "code": "INVALID_CREDENTIALS", "message": "string" } }
```

#### Scenario: Login com credenciais válidas — onboarding pendente
- **WHEN** o usuário faz login com credenciais corretas e `onboardingCompleted = false`
- **THEN** o sistema redireciona para `/onboarding`

#### Scenario: Login com credenciais válidas — onboarding completo
- **WHEN** o usuário faz login com credenciais corretas e `onboardingCompleted = true`
- **THEN** o sistema redireciona para `/dashboard`

#### Scenario: Login com credenciais inválidas
- **WHEN** o usuário submete e-mail ou senha incorretos
- **THEN** o sistema exibe "Credenciais inválidas" sem redirecionar

#### Scenario: Usuário autenticado acessa `/login`
- **WHEN** um usuário já logado (token válido no store) navega para `/login`
- **THEN** o sistema redireciona automaticamente para `/dashboard`

---

### Requirement: Estado de autenticação é persistido entre sessões
O sistema SHALL persistir o token JWT e os dados do usuário no `localStorage` via Zustand persist, sobrevivendo a recargas de página.

#### Scenario: Reload após login
- **WHEN** o usuário recarrega a página após ter feito login
- **THEN** o `accessToken` e os dados do usuário estão disponíveis no `authStore` sem novo login

#### Scenario: Logout limpa o estado
- **WHEN** o sistema chama `clearAuth()`
- **THEN** `accessToken` e `user` são nulos e o usuário é redirecionado para `/login`
