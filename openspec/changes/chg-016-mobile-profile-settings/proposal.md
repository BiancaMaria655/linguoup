# CHG-016 — Mobile: Perfil, Configurações & Notificações (INT-19, INT-20, INT-21)

## Versão do Roadmap
**V1 — MVP**

## Descrição
Implementação das telas de Perfil do Usuário, Configurações e Centro de Notificações no app React Native. Completa a aba "Perfil" da navegação principal e permite ao usuário controlar suas preferências de aprendizado e notificações.

## Contexto
Dependências: CHG-005 (users API), CHG-010 (notifications API), CHG-011 (design system), CHG-013 (navegação principal). Os protótipos de referência no Stitch (projeto `projects/13167686388520823014`):
- `8463ee2535f4421d9a97c1ffa3061744` — **Perfil e Conquistas** (mobile, 390×1566px)

## Telas Implementadas

| Interface | Tela Stitch de Referência | Screen ID |
|-----------|---------------------------|-----------|
| INT-19 Centro de Notificações | — (lista de notificações) | — |
| INT-20 Configurações | — (formulário de preferências) | — |
| INT-21 Perfil do Usuário | Perfil e Conquistas (mobile) | `8463ee2535f4421d9a97c1ffa3061744` |

## Escopo

### O que está incluído

**INT-21 — Perfil do Usuário:**
- Avatar (inicial do nome), nome, email
- Objetivo de aprendizado e idioma selecionado
- Nível atual + XP
- Streak atual
- Acesso rápido a Conquistas (link para INT-16)
- Botão "Editar Perfil" → bottom sheet com campo de nome

**INT-20 — Configurações:**
- Frequência de notificações (nunca, 1x, 2x, 3x por dia)
- Horário preferencial de estudo (time picker)
- Meta diária de minutos
- Idioma da interface (MVP: apenas PT-BR)
- Botão "Salvar" → `PATCH /api/v1/users/me` + `POST /api/v1/users/me/onboarding`
- Botão "Sair da Conta" → logout + navegar para Boas-vindas
- Links: Política de Privacidade, Termos de Uso

**INT-19 — Centro de Notificações:**
- Lista paginada de notificações recebidas
- Status visual: lida (cinza) / não lida (indigo)
- Swipe para "Marcar como lida"
- Contagem de não lidas no ícone da aba

**Testes:**
- Unitários: hook `useSettingsScreen` (salvar preferências)
- E2E: jornada "abrir perfil → editar nome → salvar → ver atualizado"

### Non-goals
- Upload de foto de perfil (S3 — V2)
- Login social na tela de configurações
- Exclusão de conta (LGPD — V2, com fluxo de confirmação)
- Temas visuais (dark mode — V2)
- Idioma da interface em outros idiomas além de PT-BR

## Tamanho, Complexidade e Risco
| Dimensão    | Avaliação | Justificativa |
|-------------|-----------|---------------|
| Tamanho     | Médio     | 3 telas com formulários e integrações |
| Complexidade| Baixa/Média | Formulários simples + swipe gesture + logout |
| Risco       | Baixo     | Fluxo de configurações; sem impacto em dados de progresso |

## Plano de Verificação
```bash
pnpm dev --filter=mobile
pnpm test --filter=mobile
# Testar: editar nome → salvar → verificar atualização na Home
# Testar: logout → redirecionar para Boas-vindas → token limpo
# Testar: alterar horário de notificação → verificar persistência
# Verificar: marcar notificação como lida via swipe
```
