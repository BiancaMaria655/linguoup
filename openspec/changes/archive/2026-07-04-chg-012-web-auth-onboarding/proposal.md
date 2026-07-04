# CHG-012 — Web Client: Autenticação & Onboarding (Telas INT-01 a INT-09)

## Versão do Roadmap
**V1 — MVP**

## Descrição
Implementação das telas de autenticação e onboarding no Next.js Web Client: Splash/Loader Screen, Boas-vindas, Cadastro/Login, Objetivo de Aprendizado, Idioma Desejado, Disponibilidade Diária, Plano Inicial, Avaliação de Nível e Resultado da Avaliação. Cobre o fluxo de primeira utilização completo.

## Contexto
Dependências: CHG-004 (auth API), CHG-005 (users/onboarding API), CHG-006 (assessment API), CHG-011 (design system). Os protótipos estão disponíveis no Stitch (projeto `projects/13167686388520823014`):
- `366558076ad74978ab390dbfcebe3d1d` — **Cadastro e Login** (mobile viewport, 390×1515px)
- `4c944ac3184740a7b161656e5f825a4e` — **Objetivos e Idioma** (mobile viewport, 390×936px)
- `d2fec5bb7ae84108ac794d7209063f6c` — **Disponibilidade e Plano Inicial** (mobile viewport, 390×1181px)
- `ef5b80bf8f51483d97812fd66698728e` — **Boas-vindas (Links Atualizados)** (mobile viewport, hidden)
- `88d4dcb398c248efa8ce3cb8ccfc1e9d` — **Login (Desktop)** (referência, hidden)

## Telas Implementadas

| Interface | Tela Stitch de Referência | Screen ID |
|-----------|---------------------------|----------|
| INT-01 Splash Screen | — (animação de logo / loader) | — |
| INT-02 Boas-vindas | Boas-vindas (Links Atualizados) | `ef5b80bf8f51483d97812fd66698728e` |
| INT-03 Cadastro e Login | Cadastro e Login (mobile/web format) | `366558076ad74978ab390dbfcebe3d1d` |
| INT-04 Objetivo de Aprendizado | Objetivos e Idioma | `4c944ac3184740a7b161656e5f825a4e` |
| INT-05 Idioma Desejado | Objetivos e Idioma | `4c944ac3184740a7b161656e5f825a4e` |
| INT-06 Disponibilidade Diária | Disponibilidade e Plano Inicial | `d2fec5bb7ae84108ac794d7209063f6c` |
| INT-07 Resultado do Plano Inicial | Disponibilidade e Plano Inicial | `d2fec5bb7ae84108ac794d7209063f6c` |
| INT-08 Avaliação de Nível | — (fluxo de questionário) | — |
| INT-09 Resultado da Avaliação | — (resultado com nível) | — |

## Escopo

### O que está incluído

**Navegação / Rotas Next.js:**
- Rotas de autenticação do aluno: `/login`, `/register` (grupo `(auth)`)
- Rotas do fluxo de onboarding: `/onboarding`
- Rota de nivelamento: `/assessment`
- Redirecionamento automático do usuário logado para `/dashboard` após onboarding

**State Management:**
- Zustand: `authStore` (token, usuário autenticado, estado de onboarding)
- TanStack Query: `useRegister`, `useLogin`, `useOnboarding`, `useAssessment`

**Telas (separação UI/lógica):**
- Cada tela: componente de UI puro + hook de lógica (ex: `useLoginScreen`)
- Sem lógica de negócio nos componentes

**Fluxo de navegação máximo 3 toques para iniciar aprendizado** (conforme spec_ui.md)

**Testes:**
- Unitários: hooks `useLoginScreen`, `useOnboardingScreen`
- E2E (Playwright): jornada completa "abrir site → cadastrar → onboarding → ver resultado"

### Non-goals
- Login social Google/Apple
- Recuperação de senha
- Telas pós-login (CHG-013, CHG-014)

## Tamanho, Complexidade e Risco
| Dimensão    | Avaliação | Justificativa |
|-------------|-----------|---------------|
| Tamanho     | Médio     | 9 telas / layouts + rotas Next.js |
| Complexidade| Média     | Fluxo de onboarding multi-step responsivo + integração de APIs + Zustand |
| Risco       | Médio     | Fluxo crítico de primeiro uso; testes E2E obrigatórios no Playwright |

## Plano de Verificação
```bash
pnpm dev --filter=web
pnpm test --filter=web
# Testar fluxo completo: abrir site → cadastrar → onboarding → ver plano → avaliação → resultado
# Verificar que token é salvo corretamente no Zustand e persiste entre sessões
# Verificar acessibilidade: WCAG 2.1 AA
```
