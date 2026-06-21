## Context

A implementação do domínio de autenticação (Auth Domain) no backend NestJS fornecerá a infraestrutura necessária para gerenciar identidades de usuários, emissão e renovação de tokens JWT (JSON Web Tokens), e invalidação de sessões (logout). Seguindo a Clean Architecture e os padrões de segurança do projeto LinguoUp, este componente garantirá que todas as comunicações sejam autenticadas e autorizadas de forma segura e com suporte a multi-tenancy (`tenant_id`).

## Goals / Non-Goals

**Goals:**
* Implementar o fluxo de registro (`POST /api/v1/auth/register`) salvando a senha como hash Argon2id e validando o `tenant_id`.
* Implementar o fluxo de login (`POST /api/v1/auth/login`) retornando um Access Token JWT (validade de 15 minutos) e um Refresh Token rotativo (validade de 30 dias, enviado como cookie HttpOnly seguro).
* Implementar o fluxo de renovação de tokens (`POST /api/v1/auth/refresh`) validando o Refresh Token anterior, invalidando-o e emitindo um novo par de tokens (Refresh Token Rotation).
* Implementar o fluxo de logout (`POST /api/v1/auth/logout`) inserindo o Refresh Token atual na blacklist do Redis.
* Garantir isolamento de dados obrigatório validando o `tenant_id` extraído do payload/JWT.
* Garantir controle de acessos usando Guardas Baseados em Roles (RBAC) com as roles `USER`, `ADMIN`, `SUPER_ADMIN`.
* Aplicar rate limiting de até 10 requisições/minuto por IP nas rotas de autenticação.
* Integrar logs estruturados e métricas de observabilidade.

**Non-Goals:**
* Implementação de fluxos de login social (Google e Apple) — planejados para chg-005.
* Implementação de MFA (Multi-Factor Authentication) — planejada para fases futuras.
* Envio de e-mails para redefinição de senha ou confirmação de conta.
* Interface gráfica de login ou registro no aplicativo mobile ou web admin.

## Decisions

### Decision 1: Estrutura do Domínio de Autenticação no NestJS (Clean Architecture)
Seguindo as regras de desenvolvimento do LinguoUp, o fluxo será estruturado da seguinte forma:
* **Controller**: `AuthController` interceptará as requisições HTTP e validará a entrada (com DTOs class-validator).
* **Use Cases**: `RegisterUserUseCase`, `LoginUserUseCase`, `RefreshTokenUseCase`, e `LogoutUseCase` encapsularão as regras de negócio de cada caso de uso.
* **Domain Service**: `AuthDomainService` conterá a lógica de senhas (comparação e hashing Argon2id) e de geração de tokens JWT.
* **Repository**: `UserRepository` fará o acesso direto ao Prisma.
* **Guards**: `JwtAuthGuard` e `RolesGuard` para proteger as rotas.

*Alternativas consideradas:*
* *Lógica no Controller*: Rejeitado por violar a Clean Architecture e a separação de responsabilidades.
* *Implementação direta sem Use Cases*: Rejeitado para manter o alinhamento com a arquitetura do LinguoUp e facilitar a migração futura para microsserviços.

### Decision 2: Hashing de Senhas com Argon2id
Utilizaremos a biblioteca `argon2` para hashing de senhas. Argon2id é o vencedor da Password Hashing Competition e oferece a melhor proteção contra ataques de força bruta paralelos (GPU/ASIC) e side-channel.

*Alternativas consideradas:*
* *bcrypt*: Rejeitado. Embora popular, é menos seguro contra ataques modernos em hardware paralelo se comparado ao Argon2id.
* *scrypt*: Rejeitado, pois Argon2id oferece melhores propriedades de balanceamento de memória/tempo.

### Decision 3: Gerenciamento de Sessão com Refresh Token Rotativo e Blacklist no Redis
Para garantir a segurança, os Access Tokens JWT terão curta duração (15 minutos) e os Refresh Tokens longa duração (30 dias).
* O Refresh Token será transmitido como cookie HttpOnly, Secure, SameSite=Strict para mitigar ataques XSS e CSRF.
* Cada chamada a `/auth/refresh` invalidará o Refresh Token atual e gerará um novo (Refresh Token Rotation). Se um token antigo for reusado, assumimos detecção de roubo de token e invalidamos toda a cadeia de tokens daquele usuário.
* O logout e a invalidação de Refresh Tokens usarão o Redis como blacklist de tokens inválidos com TTL correspondente ao tempo de expiração restante do token.

*Alternativas consideradas:*
* *Refresh Token persistido apenas no banco relacional*: Rejeitado devido à latência de escrita/leitura. O Redis oferece alta performance para verificações frequentes de blacklist.
* *Sessão puramente Stateful (Session IDs)*: Rejeitado para viabilizar maior escalabilidade horizontal do monólito sem gargalos no banco.

### Decision 4: Rate Limiting nos Endpoints de Auth (10 req/min por IP)
Utilização do `@nestjs/throttler` configurado globalmente ou especificamente para as rotas do `/auth`. O limite será de 10 requisições a cada 60 segundos por IP.

*Alternativas consideradas:*
* *Rate limiting no Nginx/API Gateway*: Excelente alternativa para produção, mas para o MVP manteremos o rate limit no nível da aplicação para simplificar a infraestrutura inicial e garantir que funcione localmente via Docker Compose sem configurações adicionais.

## Risks / Trade-offs

* **[Risco] Vazamento de Refresh Tokens via XSS** → *Mitigação*: Uso de cookies com flag `HttpOnly` impedindo o acesso ao token por scripts JS no frontend.
* **[Risco] Reuso malicioso de Refresh Tokens (Token Theft)** → *Mitigação*: Implementação de Refresh Token Rotation (RTR). Caso um Refresh Token já utilizado seja apresentado, a família inteira de tokens daquele usuário será imediatamente revogada no Redis.
* **[Risco] Gargalo de conexões ao Redis na validação dos tokens** → *Mitigação*: TTL curto e limitação do tamanho da blacklist de modo que somente tokens ativos e revogados ocupem memória. O Access Token é validado de forma Stateless (assinatura RS256/HS256 local) sem consultar o Redis, minimizando o overhead.
