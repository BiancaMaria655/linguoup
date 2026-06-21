# Tasks

## 1. Preparação e Dependências

- [x] 1.1 `[apps/api]` Instalar dependências adicionais (`argon2`, `@nestjs/jwt`, `@nestjs/throttler`, `cookie-parser` e `@types/cookie-parser`). Critério de conclusão: pnpm install com sucesso e build geral passando.
- [x] 1.2 `[apps/api]` Configurar as variáveis de ambiente necessárias em `.env.example` e expô-las no ConfigService (JWT_SECRET, REFRESH_TOKEN_SECRET, etc.). Critério de conclusão: pnpm build executa sem erros de carregamento de configuração.

## 2. Camada de Persistência e Domínio

- [x] 2.1 `[apps/api]` Criar interface e classe de implementação `UserRepository` para operações no banco de dados via Prisma. Critério de conclusão: pnpm typecheck com sucesso.
- [x] 2.2 `[apps/api]` Implementar `AuthDomainService` contendo a lógica de hashing/comparação de senhas usando argon2 e geração de JWTs de acesso e renovação. Critério de conclusão: Testes unitários com 100% de cobertura.

## 3. Casos de Uso (Application Layer)

- [x] 3.1 `[apps/api]` Criar `RegisterUserUseCase` com validação de dados, hashing de senha e validação de tenant_id. Critério de conclusão: Testes unitários cobrindo fluxos de sucesso e duplicidade de e-mail passando.
- [x] 3.2 `[apps/api]` Criar `LoginUserUseCase` para autenticação de usuário e geração de tokens. Critério de conclusão: Testes unitários cobrindo credenciais válidas e inválidas passando.
- [x] 3.3 `[apps/api]` Criar `RefreshTokenUseCase` com suporte à rotação de tokens (RTR) e detecção de reuso. Critério de conclusão: Testes unitários cobrindo rotação normal e detecção de roubo de token passando.
- [x] 3.4 `[apps/api]` Criar `LogoutUseCase` integrando com Redis para inserção de Refresh Token na blacklist. Critério de conclusão: Testes unitários simulando inserção correta na blacklist passando.

## 4. Adaptadores HTTP e Guards

- [x] 4.1 `[apps/api]` Habilitar cookie-parser no main.ts e configurar ThrottlerModule globalmente. Critério de conclusão: NestJS inicializa com sucesso e limite de requisições de 10 req/min é verificado.
- [x] 4.2 `[apps/api]` Implementar AuthController com endpoints de registro, login, refresh e logout. Critério de conclusão: Validação de DTOs class-validator e cookies HttpOnly funcionando.
- [x] 4.3 `[apps/api]` Criar JwtAuthGuard e RolesGuard para extrair claims de token JWT, expor usuário/tenant no Request e proteger endpoints via RBAC. Critério de conclusão: Rotas protegidas retornam 401/403 sob condições de acesso inválido.

## 5. Testes de Integração e E2E

- [x] 5.1 `[apps/api]` Criar testes de integração/E2E cobrindo toda a jornada crítica (registro -> login -> obter tokens -> autenticar -> refresh -> logout). Critério de conclusão: Todos os testes E2E passam localmente.

## 6. Observabilidade e Validação Final

- [x] 6.1 `[apps/api]` Injetar Logger nos Use Cases e Controllers para logs estruturados com trace_id, user_id e tenant_id. Critério de conclusão: Logs gerados no console no formato esperado.
- [x] 6.2 `[apps/api]` Executar pipeline local completa de validação. Critério de conclusão: pnpm lint && pnpm typecheck && pnpm test && pnpm build terminam com sucesso sem erros.
