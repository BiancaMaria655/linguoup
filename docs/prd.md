# Definição de Requisitos do Produto (PRD)

## Descrição do Produto

### Problema

Milhões de pessoas desejam aprender um novo idioma, mas enfrentam dificuldades para manter uma rotina consistente de estudos. A falta de tempo, a baixa motivação e a dificuldade em transformar o aprendizado em um hábito diário levam a altas taxas de abandono antes que os usuários alcancem proficiência.

### Solução

Uma plataforma mobile-first de aprendizado de idiomas baseada em microaprendizagem, que transforma pequenos momentos do dia em oportunidades de estudo por meio de lições rápidas, personalização, gamificação e mecanismos de formação de hábitos.

### Para o público-alvo

Para adultos entre 18 e 45 anos com rotinas ocupadas, a plataforma oferece uma forma simples, acessível e contínua de aprender idiomas sem exigir longos períodos de dedicação diária, aumentando a consistência dos estudos e a retenção do conhecimento.

### Nossos Diferenciais

* Microlições de 3 a 5 minutos.
* Aprendizado adaptado à rotina do usuário.
* Gamificação focada em formação de hábito.
* Reforço inteligente de conteúdo utilizando repetição espaçada.
* Prática contextual baseada em situações do cotidiano.
* Metas diárias personalizáveis.
* Experiência mobile-first com acesso offline.
* Sistema de lembretes inteligentes baseado em comportamento.

---

## Perfis de Usuário

### Usuário 1: Profissional Ocupado

* Problemas:

  * Falta de tempo para estudar.
  * Rotina imprevisível.
  * Dificuldade em manter consistência.

* Objetivos:

  * Aprender um idioma para crescimento profissional.
  * Melhorar comunicação em viagens e reuniões.
  * Criar uma rotina sustentável de aprendizado.

* Dados demográficos:

  * 25 a 45 anos.
  * Empregado em período integral.
  * Usuário frequente de smartphones.

* Motivações:

  * Promoções profissionais.
  * Oportunidades internacionais.
  * Desenvolvimento pessoal.

* Frustrações:

  * Cursos longos e complexos.
  * Sensação de progresso lento.
  * Falta de motivação após algumas semanas.

---

### Usuário 2: Universitário

* Problemas:

  * Conciliação entre estudos e aprendizado de idiomas.
  * Dificuldade de praticar diariamente.

* Objetivos:

  * Intercâmbio acadêmico.
  * Certificações de proficiência.
  * Consumo de conteúdo internacional.

* Dados demográficos:

  * 18 a 30 anos.
  * Estudante universitário.

* Motivações:

  * Oportunidades acadêmicas.
  * Acesso a conteúdo global.
  * Desenvolvimento de carreira.

* Frustrações:

  * Falta de disciplina.
  * Conteúdo pouco engajador.

---

### Usuário 3: Aprendiz Casual

* Problemas:

  * Baixa motivação de longo prazo.
  * Não possui objetivo formal.

* Objetivos:

  * Aprender por hobby.
  * Consumir filmes, séries e músicas em outro idioma.

* Dados demográficos:

  * 18 a 45 anos.
  * Diversos níveis de escolaridade.

* Motivações:

  * Curiosidade cultural.
  * Entretenimento.

* Frustrações:

  * Aplicativos repetitivos.
  * Falta de percepção de evolução.

---

## Principais Funcionalidades

### RFN-01 Cadastro e Onboarding Personalizado

* Permitir criação de conta por e-mail, Google ou Apple.
* Identificar idioma desejado.
* Capturar objetivo principal do usuário.
* Definir disponibilidade diária de estudo.

Critérios de Aceitação:

* Usuário consegue concluir cadastro em menos de 3 minutos.
* Sistema cria plano inicial personalizado.
* Perfil é salvo automaticamente.

---

### RFN-02 Avaliação de Nível Inicial

* Aplicar teste rápido para identificar proficiência.
* Posicionar usuário no nível adequado.

Critérios de Aceitação:

* Avaliação concluída em até 10 minutos.
* Sistema recomenda trilha adequada.
* Resultado apresentado imediatamente.

---

### RFN-03 Microlições Diárias

* Disponibilizar lições curtas de 3 a 5 minutos.
* Conteúdo dividido por temas e níveis.

Critérios de Aceitação:

* Usuário consegue concluir uma lição em menos de 5 minutos.
* Sistema registra progresso automaticamente.
* Lições podem ser retomadas posteriormente.

---

### RFN-04 Sistema de Formação de Hábito

* Registro de sequência diária (streak).
* Metas personalizadas.
* Indicadores de progresso.

Critérios de Aceitação:

* Sistema atualiza streak automaticamente.
* Usuário recebe feedback visual após cada atividade.
* Histórico fica disponível para consulta.

---

### RFN-05 Notificações Inteligentes

* Envio de lembretes personalizados.
* Horários adaptados ao comportamento do usuário.

Critérios de Aceitação:

* Usuário pode configurar frequência.
* Sistema evita excesso de notificações.
* Taxa de abertura das notificações é monitorada.

---

### RFN-06 Repetição Espaçada

* Revisão automática de conteúdos aprendidos.
* Priorização de itens com maior chance de esquecimento.

Critérios de Aceitação:

* Sistema gera revisões automaticamente.
* Usuário recebe sugestões diárias de revisão.
* Taxa de retenção é monitorada.

---

### RFN-07 Gamificação

* Pontos de experiência (XP).
* Conquistas.
* Níveis de progresso.

Critérios de Aceitação:

* Usuário recebe XP após cada atividade.
* Sistema exibe evolução visual.
* Conquistas são desbloqueadas automaticamente.

---

### RFN-08 Dashboard de Progresso

* Visualização de métricas de aprendizado.
* Acompanhamento de metas.

Critérios de Aceitação:

* Usuário visualiza progresso semanal e mensal.
* Dashboard atualiza em tempo real.
* Dados históricos permanecem acessíveis.

---

### RFN-09 Modo Offline

* Download de lições.
* Sincronização automática ao reconectar.

Critérios de Aceitação:

* Usuário acessa conteúdo sem internet.
* Progresso é sincronizado posteriormente.
* Não há perda de dados.

---

### RFN-10 Prática de Conversação com IA

* Simulações de conversas reais.
* Feedback sobre vocabulário e gramática.

Critérios de Aceitação:

* Usuário consegue iniciar uma conversa em até 2 cliques.
* Feedback é fornecido ao final da sessão.
* Histórico fica armazenado.

---

## Requisitos Não Funcionais

### RNF-01 - Disponibilidade

O sistema deverá possuir disponibilidade mínima de 99,5% mensal.

---

### RNF-02 - Performance

O carregamento das telas principais deverá ocorrer em até 2 segundos.

---

### RNF-03 - Escalabilidade

A plataforma deverá suportar crescimento de até 1 milhão de usuários ativos sem degradação significativa.

---

### RNF-04 - Segurança

Todos os dados pessoais deverão ser protegidos utilizando criptografia em trânsito e em repouso.

---

### RNF-05 - Privacidade

O produto deverá estar em conformidade com LGPD e demais regulamentações aplicáveis.

---

### RNF-06 - Compatibilidade

O aplicativo deverá funcionar nas versões suportadas de Android e iOS.

---

### RNF-07 - Acessibilidade

A interface deverá seguir diretrizes WCAG 2.1 nível AA.

---

### RNF-08 - Confiabilidade

O sistema deverá garantir persistência e recuperação de progresso em caso de falhas.

---

## Métricas de Sucesso

### Aquisição

* Número de novos usuários por mês.
* Taxa de conversão do onboarding.
* Custo de aquisição por usuário (CAC).

### Engajamento

* DAU (Daily Active Users).
* WAU (Weekly Active Users).
* Tempo médio diário de uso.
* Lições concluídas por usuário.

### Retenção

* Retenção D1, D7 e D30.
* Taxa de manutenção de streak.
* Churn mensal.

### Aprendizado

* Taxa de conclusão de trilhas.
* Taxa de retenção de vocabulário.
* Evolução média de proficiência.

### Negócio

* Conversão para plano premium.
* Receita recorrente mensal (MRR).
* LTV/CAC.

---

## Premissas e Restrições

### Premissas

* Usuários possuem smartphones e acesso frequente à internet.
* Sessões curtas são mais fáceis de incorporar à rotina.
* Gamificação aumenta engajamento e retenção.
* Repetição espaçada melhora retenção do aprendizado.

### Restrições

* Orçamento limitado para desenvolvimento inicial.
* Necessidade de lançar MVP em até 6 meses.
* Disponibilidade inicial para apenas um idioma de aprendizado.
* Equipe reduzida de produto e engenharia.

---

## Escopo

### V1 - MVP

* Cadastro e login.
* Onboarding personalizado.
* Avaliação de nível.
* Microlições.
* Sistema de streak.
* Metas diárias.
* Notificações.
* Dashboard básico.
* Gamificação básica.

Objetivo:
Validar engajamento, frequência de uso e retenção.

---

### V2

* Repetição espaçada avançada.
* Conteúdo offline.
* Trilhas personalizadas.
* Novos idiomas.
* Dashboard avançado.

Objetivo:
Aumentar retenção e percepção de progresso.

---

### V3

* Conversação com IA.
* Feedback automatizado de fala.
* Comunidade de usuários.
* Rankings e desafios sociais.

Objetivo:
Aumentar proficiência e monetização.

---

### V4

* Certificações.
* Integração com plataformas educacionais.
* Planos corporativos.
* Trilhas profissionais específicas.

Objetivo:
Expandir receita e mercado B2B.
