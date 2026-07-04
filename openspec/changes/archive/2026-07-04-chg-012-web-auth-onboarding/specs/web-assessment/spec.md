## ADDED Requirements

### Requirement: Usuário responde avaliação de nível inicial
O sistema SHALL apresentar um questionário de múltipla escolha (mínimo 5 questões) para determinar o nível inicial do aluno, com feedback visual imediato por questão.

**Endpoint de busca de questões (opcional):** `GET /api/v1/assessment/questions?language=<lang>`
**Response (200):**
```json
{ "data": [{ "id": "string", "text": "string", "options": ["string"], "correctIndex": 0 }] }
```
**Fallback:** Questões locais estáticas se a API falhar ou não retornar dados.

**Endpoint de submissão:** `POST /api/v1/assessment/submit`
**Request:**
```json
{
  "answers": [{ "questionId": "string", "selectedIndex": 0 }],
  "score": 3,
  "total": 5
}
```
**Response (200):**
```json
{ "data": { "level": "BEGINNER | BASIC | INTERMEDIATE", "score": 3, "total": 5 } }
```

#### Scenario: Seleção de alternativa mostra feedback imediato
- **WHEN** o usuário seleciona uma alternativa
- **THEN** a alternativa correta fica verde, a incorreta (se selecionada) fica vermelha e o botão "Próxima" aparece

#### Scenario: Conclusão da avaliação mostra resultado
- **WHEN** o usuário responde a última questão e clica "Ver resultado"
- **THEN** o sistema exibe a tela INT-09 com o nível detectado (Iniciante/Básico/Intermediário) e pontuação

#### Scenario: Submissão ao backend é não-bloqueante
- **WHEN** a submissão para `/api/v1/assessment/submit` falha
- **THEN** a tela de resultado ainda é exibida normalmente (falha silenciosa)

#### Scenario: Usuário pula a avaliação
- **WHEN** o usuário clica "Pular avaliação"
- **THEN** o sistema redireciona para `/dashboard` sem submeter respostas

#### Scenario: Progresso da avaliação é visível
- **WHEN** o usuário avança pelas questões
- **THEN** a barra de progresso superior e o contador "Questão X de Y" atualizam a cada questão

### Requirement: Resultado da avaliação exibe nível e mensagem motivacional
O sistema SHALL exibir o nível detectado com emoji correspondente e mensagem adaptada ao resultado na tela INT-09.

**Mapeamento de nível:**
- Score 4-5: "Intermediário" 🚀 — mensagem de desafio
- Score 2-3: "Básico" 📚 — mensagem de construção
- Score 0-1: "Iniciante" 🌱 — mensagem de fundação

#### Scenario: Nível Intermediário exibido corretamente
- **WHEN** o usuário acerta 4 ou mais questões
- **THEN** o sistema exibe "Intermediário" com emoji 🚀

#### Scenario: CTA para iniciar aprendizado
- **WHEN** a tela de resultado é exibida
- **THEN** o botão "Iniciar Aprendizado →" leva para `/dashboard`
