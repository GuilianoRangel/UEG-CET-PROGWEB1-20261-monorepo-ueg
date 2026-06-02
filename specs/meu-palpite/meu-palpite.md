# Documentação de Negócio: Meu Palpite (Copa do Mundo)

> **Veja também:** [Plano de Execução (Técnico)](meu-palpite-exec-plan.md)

## 1. Visão Geral
A funcionalidade "Meu Palpite" é uma plataforma para os usuários darem palpites nos resultados dos jogos da Copa do Mundo. A plataforma separa a responsabilidade de gestão (criar jogos e placares) para o Administrador, da responsabilidade de uso (escolher um palpite) para o Usuário comum.

## 2. Atores do Sistema
- **Administrador (Role: `admin`):** Cria, edita e exclui jogos. Define quais são as até 4 opções de placar possíveis para cada jogo. Pode encerrar manualmente o recebimento de palpites.
- **Usuário (Role: `user`):** Visualiza os jogos abertos, vê a popularidade de cada placar, e registra um único palpite por jogo. Visualiza seu histórico.

## 3. Entidades e Modelagem de Dados Rigorosa

Para a implementação técnica, o banco de dados deve refletir as entidades abaixo com os tipos primitivos estritos.

### 3.1. Entidade: Jogo (`Match`)
Armazena as informações da partida.
- `id`: string (UUID)
- `teamA`: string (Nome da seleção mandante, ex: "Brasil")
- `teamB`: string (Nome da seleção visitante, ex: "Argentina")
- `matchDate`: Date (Data e hora exata em que o jogo ocorrerá)
- `stadium`: string (Nome do estádio)
- `referee`: string (Nome do juiz)
- `isClosed`: boolean (Flag de encerramento manual. Default: `false`)
- `createdAt`: Date
- `updatedAt`: Date

**Regra de Encerramento:** Um jogo é considerado "Encerrado" se `isClosed === true` OU se a data atual (now) for maior que `matchDate`. Ninguém pode dar palpite em um jogo encerrado.

### 3.2. Entidade: Opção de Palpite (`PredictionOption`)
São os placares (resultados) pré-cadastrados pelo admin para o `Match`.
- `id`: string (UUID)
- `matchId`: string (UUID - Chave estrangeira para Match)
- `teamAScore`: number (Gols previstos para a seleção A)
- `teamBScore`: number (Gols previstos para a seleção B)

**Regra de Negócio (Restrição de Array):**
- Mínimo de 1 e Máximo de 4 `PredictionOptions` atrelados a um único `Match`. 
- Isso deve ser validado fortemente no backend no momento de criação/edição do Jogo.

### 3.3. Entidade: Meu Palpite (`UserGuess`)
O palpite final feito por um usuário comum.
- `id`: string (UUID)
- `userId`: string (UUID - Identificador do usuário que fez a aposta)
- `matchId`: string (UUID - Referência ao jogo. Redundância útil para validação rápida)
- `predictionOptionId`: string (UUID - Qual foi o placar escolhido dentre os 4 disponíveis)
- `createdAt`: Date

**Regra de Negócio (Unicidade):**
- A combinação `[userId, matchId]` deve ser **ÚNICA**. Um usuário não pode cadastrar mais de um UserGuess para o mesmo Match.

## 4. Requisitos de Interface (UI/UX)

### 4.1. Área do Administrador
- **Listagem de Jogos (Read):** Tabela exibindo todos os jogos, ordenados por data. Deve exibir um badge visual "Aberto" ou "Encerrado".
- **Cadastro de Jogos (Create):**
  - Dropdowns alimentados por constantes na memória (ex: `const TEAMS = ['Brasil', 'Argentina', ...];`).
  - O formulário envia no payload da requisição de criação de Jogo (`POST /matches`) um array `predictionOptions: []`.
  - A interface deve bloquear a adição de novas opções de placar quando o tamanho do array atingir 4.
- **Edição de Jogos (Update):** Permite alterar dados da partida e modificar/remover opções de palpite, sempre respeitando a trava máxima de 4 opções.
- **Exclusão de Jogos (Delete):** A ação de exclusão deve OBRIGATORIAMENTE exibir um Modal de Confirmação customizado da interface (Design System). O uso da função nativa `confirm()` do JavaScript é estritamente proibido.

### 4.2. Área do Usuário
- **Aba: Jogos Abertos (Para Palpitar):**
  - Exibe os jogos não encerrados.
  - Para cada opção de placar (`PredictionOption`) do jogo, exibir a contagem de pessoas que já selecionaram aquela opção. (Ex: "O placar 2x1 possui 5 palpites").
- **Aba: Meus Jogos Encerrados:**
  - Histórico do usuário. Mostra apenas os jogos encerrados nos quais o usuário possui um `UserGuess` registrado.
  - O design deve exibir os contadores de palpites (`guessCount`) para cada um dos placares do jogo (para o usuário ver como a comunidade votou).
  - A opção exata que o usuário logado selecionou deve possuir um destaque visual claro (ex: cor de fundo diferenciada, borda ou ícone de "Sua Escolha"), diferenciando-a das demais opções disponíveis.
