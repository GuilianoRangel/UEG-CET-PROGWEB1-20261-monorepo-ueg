---
name: new-feature
description: Fluxo de implementação técnica de novas funcionalidades usando TDD, exigindo planejamento prévio obrigatório.
---

# Skill: New Feature

Quando solicitado a implementar (codificar) uma nova feature, você DEVE atuar em conjunto com a skill de `implementation-planning` e seguir esta ordem rigorosamente:

## 0. Planejamento Prévio (OBRIGATÓRIO E BLOQUEANTE)
- Você NÃO PODE iniciar a escrita de código de uma feature sem que a documentação de negócios e o plano técnico de execução existam.
- Se não existirem, utilize a skill `implementation-planning` para criar os documentos `specs/[feature]/*.md`.
- Leia ambos os documentos atentamente antes de prosseguir.
- **DURANTE A IMPLEMENTAÇÃO:** Você deve atuar sob as ordens da skill `execute-plan`, o que significa que OBRIGATORIAMENTE você deve ir editando e marcando com `[x]` as tarefas do roteiro técnico (`-exec-plan.md`) à medida que avança.

## 1. Definição de contrato
- Baseado na especificação de negócio, crie tipos/interfaces e DTOs compartilhados em `packages/utils/src/`.
- Exporte tudo via `@repo/utils`.

## 2. Testes primeiro (TDD obrigatório)
- Criar testes unitários ANTES da implementação.
- **Referência:** Utilize a lista exata de "Casos de Teste Unitário" mapeada no arquivo `[feature]-exec-plan.md`.
- Backend:
  - Testar regras de negócio, limites e restrições nos `services`.
  - Validar disparos da `BusinessException`.
- Frontend:
  - Testar comportamento dos componentes e regras de tela estipuladas.

## 3. Implementação Backend (NestJS)
- Criar módulo por domínio em `apps/backend/src/`.
  - module, controller, service, dto.
- Aplicar:
  - DTOs com `class-validator` (ver plano técnico).
  - Lógica no service, orquestração no controller.
- Tratamento global de erros via `ExceptionFilter` em conjunto com a `BusinessException`.

## 4. Implementação Frontend (Angular)
- Criar componentes em `apps/frontend/src/app/` segundo a arquitetura do projeto.
- Seguir a padronização do Design System UEG (uso obrigatório de modais customizados para exclusões, não use `confirm()`).
- Padrão reativo usando:
  - Reactive Forms (`FormBuilder`, `FormArray`).
  - Gestão de estado moderna via `Signals`.
  - Estilização com TailwindCSS.

## 5. Integração
- Consumir backend via HttpClient (geralmente serviços centralizados em `core/http`).

## 6. Validação final (OBRIGATÓRIO)
- Executar TODOS os testes unitários após a implementação da feature (`pnpm test`).
- Garantir 100% de passagem nos testes da regra de negócio da funcionalidade.
- A entrega só é considerada pronta quando o pipeline de testes for cumprido com sucesso.