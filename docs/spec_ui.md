Abaixo está uma proposta completa de **spec_ui.md** alinhada ao PRD e ao escopo do MVP, já preparada para servir como insumo para Design, Produto e Engenharia.

# Especificação de UI

## Interfaces gráficas

### INT-01 - Splash Screen

* **Tipo:** Página
* **Campos:** Nenhum
* **Botões:** Nenhum
* **Links:** Nenhum
* **Considerações:**

  * Exibe logo e identidade visual.
  * Verificação automática de autenticação.
  * Tempo máximo recomendado: 2 segundos.

---

### INT-02 - Boas-vindas

* **Tipo:** Página
* **Campos:** Nenhum
* **Botões:**

  * Começar
  * Entrar
* **Links:**

  * Termos de Uso
  * Política de Privacidade
* **Considerações:**

  * Apresentar proposta de valor.
  * Destacar aprendizado em poucos minutos por dia.

---

### INT-03 - Cadastro e Login

* **Tipo:** Formulário
* **Campos:**

  * Nome
  * E-mail
  * Senha
* **Botões:**

  * Criar Conta
  * Continuar com Google
  * Continuar com Apple
  * Entrar
* **Links:**

  * Esqueci minha senha
* **Considerações:**

  * Processo simplificado.
  * Feedback imediato de erros.

---

### INT-04 - Onboarding: Objetivo de Aprendizado

* **Tipo:** Formulário de seleção
* **Campos:**

  * Objetivo principal

    * Trabalho
    * Viagem
    * Estudos
    * Hobby
    * Outro
* **Botões:**

  * Continuar
  * Voltar
* **Links:** Nenhum
* **Considerações:**

  * Seleção visual em cards.

---

### INT-05 - Onboarding: Idioma Desejado

* **Tipo:** Formulário de seleção
* **Campos:**

  * Idioma desejado
* **Botões:**

  * Continuar
  * Voltar
* **Links:** Nenhum
* **Considerações:**

  * MVP suporta apenas um idioma.

---

### INT-06 - Onboarding: Disponibilidade Diária

* **Tipo:** Formulário
* **Campos:**

  * Tempo disponível por dia
  * Horário preferencial de estudo
* **Botões:**

  * Criar Plano
  * Voltar
* **Links:** Nenhum
* **Considerações:**

  * Sugestão automática baseada nas respostas anteriores.

---

### INT-07 - Resultado do Plano Inicial

* **Tipo:** Página informativa
* **Campos:**

  * Objetivo selecionado
  * Meta diária recomendada
  * Tempo diário recomendado
* **Botões:**

  * Iniciar Avaliação
  * Pular Avaliação
* **Links:** Nenhum
* **Considerações:**

  * Exibir resumo personalizado.

---

### INT-08 - Avaliação de Nível

* **Tipo:** Fluxo de Questionário
* **Campos:**

  * Perguntas objetivas
  * Exercícios de vocabulário
  * Exercícios de compreensão
* **Botões:**

  * Próxima
  * Anterior
  * Finalizar
* **Links:** Nenhum
* **Considerações:**

  * Barra de progresso visível.
  * Duração máxima de 10 minutos.

---

### INT-09 - Resultado da Avaliação

* **Tipo:** Página informativa
* **Campos:**

  * Nível identificado
  * Descrição do nível
  * Trilha recomendada
* **Botões:**

  * Começar Aprendizado
* **Links:** Nenhum
* **Considerações:**

  * Exibir mensagem motivacional.

---

### INT-10 - Home Dashboard

* **Tipo:** Dashboard
* **Campos:**

  * Saudação personalizada
  * Streak atual
  * XP acumulado
  * Meta diária
  * Progresso do dia
  * Próxima lição
  * Revisões pendentes
* **Botões:**

  * Continuar Lição
  * Revisar
  * Explorar Trilhas
* **Links:**

  * Perfil
  * Progresso
  * Configurações
* **Considerações:**

  * Tela principal do aplicativo.
  * Priorizar continuidade do estudo.

---

### INT-11 - Catálogo de Trilhas

* **Tipo:** Lista
* **Campos:**

  * Nome da trilha
  * Nível
  * Percentual concluído
* **Botões:**

  * Iniciar
  * Continuar
* **Links:** Nenhum
* **Considerações:**

  * Organização por temas e níveis.

---

### INT-12 - Detalhe da Trilha

* **Tipo:** Página
* **Campos:**

  * Nome da trilha
  * Descrição
  * Lista de lições
  * Progresso
* **Botões:**

  * Iniciar próxima lição
* **Links:** Nenhum
* **Considerações:**

  * Exibir progresso visual.

---

### INT-13 - Execução da Microlição

* **Tipo:** Fluxo de aprendizado
* **Campos:**

  * Conteúdo da atividade
  * Exercícios
  * Perguntas
* **Botões:**

  * Continuar
  * Ver Dica
  * Pausar
* **Links:** Nenhum
* **Considerações:**

  * Tempo alvo de 3 a 5 minutos.
  * Navegação simples e focada.

---

### INT-14 - Resultado da Lição

* **Tipo:** Página de feedback
* **Campos:**

  * XP ganho
  * Acertos
  * Erros
  * Evolução do progresso
* **Botões:**

  * Próxima Lição
  * Revisar Conteúdo
  * Voltar para Home
* **Links:** Nenhum
* **Considerações:**

  * Feedback positivo e motivacional.

---

### INT-15 - Tela de Streak e Metas

* **Tipo:** Dashboard
* **Campos:**

  * Sequência atual
  * Melhor sequência
  * Calendário de atividades
  * Meta diária
* **Botões:**

  * Alterar Meta
* **Links:** Nenhum
* **Considerações:**

  * Reforçar hábito e consistência.

---

### INT-16 - Conquistas e Gamificação

* **Tipo:** Dashboard
* **Campos:**

  * Nível atual
  * XP total
  * Conquistas desbloqueadas
  * Próximas conquistas
* **Botões:** Nenhum
* **Links:** Nenhum
* **Considerações:**

  * Utilizar elementos visuais de progressão.

---

### INT-17 - Revisões (Repetição Espaçada)

* **Tipo:** Lista + Fluxo
* **Campos:**

  * Itens pendentes
  * Prioridade de revisão
* **Botões:**

  * Revisar Agora
  * Adiar
* **Links:** Nenhum
* **Considerações:**

  * Exibir urgência visual.

---

### INT-18 - Dashboard de Progresso

* **Tipo:** Dashboard Analítico
* **Campos:**

  * Lições concluídas
  * Tempo estudado
  * Evolução semanal
  * Evolução mensal
  * Vocabulário aprendido
* **Botões:**

  * Filtrar período
* **Links:** Nenhum
* **Considerações:**

  * Gráficos simples e legíveis.

---

### INT-19 - Centro de Notificações

* **Tipo:** Lista
* **Campos:**

  * Histórico de notificações
  * Status de leitura
* **Botões:**

  * Marcar como lida
* **Links:** Nenhum
* **Considerações:**

  * Histórico dos lembretes recebidos.

---

### INT-20 - Configurações

* **Tipo:** Formulário
* **Campos:**

  * Frequência de notificações
  * Horário preferencial
  * Meta diária
  * Idioma da interface
* **Botões:**

  * Salvar
  * Sair da Conta
* **Links:**

  * Política de Privacidade
  * Termos de Uso
* **Considerações:**

  * Controle completo das preferências.

---

### INT-21 - Perfil do Usuário

* **Tipo:** Página
* **Campos:**

  * Nome
  * Foto
  * Objetivo de aprendizado
  * Nível atual
* **Botões:**

  * Editar Perfil
* **Links:** Nenhum
* **Considerações:**

  * Dados sincronizados automaticamente.

---

### INT-22 - Conversação com IA (V3)

* **Tipo:** Chat
* **Campos:**

  * Histórico da conversa
  * Campo de mensagem
* **Botões:**

  * Enviar
  * Encerrar Conversa
* **Links:** Nenhum
* **Considerações:**

  * Acesso em até 2 cliques.
  * Feedback ao final da sessão.

---

### INT-23 - Feedback da Conversação (V3)

* **Tipo:** Relatório
* **Campos:**

  * Pontos fortes
  * Correções gramaticais
  * Sugestões de vocabulário
  * Nota de desempenho
* **Botões:**

  * Praticar Novamente
  * Salvar
* **Links:** Nenhum
* **Considerações:**

  * Linguagem encorajadora.

---

## Fluxo de Navegação

### Fluxo Principal (Primeira Utilização)

Splash Screen
→ Boas-vindas
→ Cadastro/Login
→ Objetivo de Aprendizado
→ Idioma Desejado
→ Disponibilidade Diária
→ Plano Inicial
→ Avaliação de Nível
→ Resultado da Avaliação
→ Home Dashboard

---

### Fluxo de Aprendizado Diário

Home Dashboard
→ Próxima Lição
→ Execução da Microlição
→ Resultado da Lição
→ Home Dashboard

---

### Fluxo de Formação de Hábito

Home Dashboard
→ Tela de Streak e Metas
→ Alteração de Meta
→ Home Dashboard

---

### Fluxo de Revisão

Home Dashboard
→ Revisões Pendentes
→ Sessão de Revisão
→ Resultado
→ Home Dashboard

---

### Fluxo de Gamificação

Home Dashboard
→ Conquistas e Gamificação
→ Detalhe da Conquista
→ Home Dashboard

---

### Fluxo de Progresso

Home Dashboard
→ Dashboard de Progresso
→ Filtro de Período
→ Dashboard Atualizado

---

### Fluxo de Configurações

Home Dashboard
→ Perfil
→ Configurações
→ Salvar Preferências

---

### Fluxo de Conversação com IA (V3)

Home Dashboard
→ Conversação com IA
→ Sessão de Conversa
→ Feedback da Conversação
→ Home Dashboard

---

## Diretrizes para IA

### Objetivo Geral

A IA deve atuar como facilitadora do aprendizado, incentivando a consistência diária e reduzindo a sensação de esforço excessivo.

---

### Personalização

* Adaptar conteúdo conforme:

  * Objetivo do usuário.
  * Nível de proficiência.
  * Histórico de desempenho.
  * Tempo disponível informado no onboarding.
* Priorizar conteúdos relevantes ao contexto do usuário.

---

### Feedback

* Utilizar linguagem positiva e motivadora.
* Destacar progresso antes de apontar erros.
* Fornecer correções claras e acionáveis.
* Evitar mensagens excessivamente técnicas.

---

### Formação de Hábito

* Reforçar a manutenção do streak.
* Celebrar pequenas conquistas.
* Incentivar sessões curtas ao invés de longas maratonas.
* Sugerir horários de estudo baseados no comportamento observado.

---

### Gamificação

* Conceder XP imediatamente após atividades concluídas.
* Exibir conquistas de forma contextual.
* Comunicar evolução de níveis de maneira visual e motivadora.

---

### Conversação com IA (V3)

* Simular situações reais do cotidiano.
* Ajustar dificuldade dinamicamente.
* Corrigir erros sem interromper excessivamente o fluxo da conversa.
* Fornecer resumo final com:

  * Vocabulário aprendido.
  * Principais erros.
  * Recomendações para evolução.

---

### Acessibilidade

* Garantir compatibilidade com leitores de tela.
* Utilizar textos alternativos em elementos visuais.
* Evitar dependência exclusiva de cores para transmitir significado.
* Suportar escalonamento de fonte conforme WCAG 2.1 AA.

---

### Princípios de UX

* Mobile-first.
* Máximo de 3 interações para iniciar uma lição.
* Feedback visual imediato após ações.
* Progresso sempre visível.
* Redução máxima de fricção durante o aprendizado.
* Priorizar continuidade ("Continuar de onde parei") em toda a experiência.

---

### Design System (Recomendação)

* Navegação inferior com 5 abas:

  * Início
  * Trilhas
  * Revisões
  * Progresso
  * Perfil
* Componentes principais:

  * Cards
  * Barras de progresso
  * Badges
  * Bottom sheets
  * Toasts de feedback
  * Skeleton loading
* Tom visual:

  * Motivador
  * Moderno
  * Leve
  * Educacional
  * Focado em pequenas vitórias diárias.
