# Plano de Execução: Meu Palpite

> **Veja também:** [Documentação de Negócio (Regras)](meu-palpite.md)

Este roteiro é projetado para guiar agentes LLM e desenvolvedores na implementação sistemática da funcionalidade, contendo detalhes aprofundados sobre classes, testes e comportamentos.

## Fase 1: Fundação e Contratos (Compartilhado)
> **Onde:** `packages/utils/src/types/meu-palpite/`

**Tarefas de Implementação:**
- [ ] Criar interface `MatchDto` e `PredictionOptionDto`.
- [ ] Criar `CreateMatchPayload` contendo os dados do jogo + `options: Array<{ teamAScore: number, teamBScore: number }>`.
- [ ] Garantir exportação no `packages/utils/src/index.ts`.

## Fase 2: Backend - Módulo de Jogos (`MatchesModule`)
> **Onde:** `apps/backend/src/matches/`

**Detalhamento Técnico:**
- [ ] **DTOs (`create-match.dto.ts`):** 
  - Usar `@ValidateNested({ each: true })` e `@Type(() => CreatePredictionOptionDto)`.
  - Usar `@ArrayMinSize(1)` e `@ArrayMaxSize(4)` no array de opções.
  - Usar `@IsDateString()` para `matchDate`.
- [ ] **Endpoints (Admin):**
  - `POST /matches` - Cria jogo e as opções na mesma transação.
  - `PUT /matches/:id` - Edita jogo.
  - `PUT /matches/:id/close` - Força o encerramento manual do jogo (`isClosed = true`).
  - `GET /matches` - Lista todos os jogos para o admin.

**Casos de Teste Unitário (TDD Obrigatório - `matches.service.spec.ts`):**
- [ ] 1. `should create a match with valid data and up to 4 options`: Testa caminho feliz.
- [ ] 2. `should throw BusinessException if options length is greater than 4`: Força erro validando a restrição principal.
- [ ] 3. `should close a match manually`: Garante que a flag `isClosed` é alternada.
- [ ] 4. `should identify match as closed dynamically`: Uma função helper `isMatchClosed(match)` deve retornar `true` se `matchDate < new Date()`.

## Fase 3: Backend - Módulo de Palpites (`GuessesModule`)
> **Onde:** `apps/backend/src/guesses/`

**Detalhamento Técnico:**
- [ ] **Endpoints (Usuário Comum):**
  - `GET /guesses/open-matches`: Retorna a lista de Jogos abertos. O payload deve injetar uma propriedade `guessCount` dentro de cada `PredictionOption` indicando quantas apostas aquele placar já recebeu.
  - `POST /guesses`: Payload simples `{ matchId, predictionOptionId }`. O `userId` deve ser extraído do `@CurrentUser()` (ou `req.user`).
  - `GET /guesses/my-closed-matches`: Retorna o histórico de jogos encerrados onde o usuário logado palestrou.

**Casos de Teste Unitário (TDD Obrigatório - `guesses.service.spec.ts`):**
- [ ] 1. `should create a user guess successfully for an open match`: Testa inserção normal.
- [ ] 2. `should throw BusinessException if user tries to guess twice on the same match`: Regra de unicidade.
- [ ] 3. `should throw BusinessException if user tries to guess on a closed match`: Validar `isMatchClosed` antes de salvar. Impede palpites tardios.
- [ ] 4. `should return guessCounts correctly mapped to predictionOptions`: Verifica se o retorno de contagem social está acurado.

## Fase 4: Frontend - Área do Admin
> **Onde:** `apps/frontend/src/app/matches/`

**Detalhamento Técnico:**
- [ ] **Rotas (Routing):**
  - `/admin/matches`: Renderiza o componente de listagem.
  - `/admin/matches/new`: Renderiza o formulário no modo criação.
  - `/admin/matches/:id/edit`: Renderiza o formulário populado para edição.
- [ ] **Serviço HTTP:** `MatchesService` implementando as chamadas para o backend (`POST /matches`, etc).
- [ ] **Lista (`matches-list.component`):** Usar o design system. Implementar pipe/função para formatar o status ("Aberto" / "Encerrado"). Ação de exclusão abre modal customizado.
- [ ] **Formulário Reativo (`matches-form.component`):**
  - Utilizar `FormBuilder`.
  - Estrutura:
    ```typescript
    this.form = this.fb.group({
      teamA: ['', Validators.required],
      matchDate: ['', Validators.required],
      // ...outros campos
      options: this.fb.array([], [Validators.required, Validators.maxLength(4)])
    });
    ```
  - **Testes de Componente:**
    - `should disable 'add option' button when options array length reaches 4`.
    - `should submit payload correctly structured with nested options`.

## Fase 5: Frontend - Área do Usuário
> **Onde:** `apps/frontend/src/app/guesses/`

**Detalhamento Técnico:**
- [ ] **Rotas (Routing):**
  - `/guesses`: Renderiza o painel do usuário (Aba de Abertos e Histórico).
- [ ] **Painel (`guess-board.component`):**
  - Gerenciamento de estado (Signals): `openMatches = signal<MatchDto[]>([])`, `myClosedMatches = signal<MatchDto[]>([])`.
  - Abas para alternar a visualização.
  - **Aba Aberta:** O design deve destacar as opções de placar e a "badge" com o `guessCount`.
  - **Fluxo de Ação:** Ao clicar em um placar, abrir modal de confirmação "Deseja confirmar este palpite?". Ao confirmar, envia o `POST` para a API, recarrega a listagem ou mostra um `toast` de sucesso bloqueando o card.
  - **Testes de Componente:**
    - `should render open matches and their prediction options with guess count badges`.
    - `should call api and show toast on successful guess submission`.
