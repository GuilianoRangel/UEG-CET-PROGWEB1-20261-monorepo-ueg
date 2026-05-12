# Skill: New Feature

Quando solicitado a criar uma nova feature, sempre:

## 0. Validação inicial (OBRIGATÓRIO)
- Verificar se foram fornecidas regras de negócio
- Caso NÃO tenham sido fornecidas:
  - Interromper a implementação
  - Solicitar explicitamente:
    - Regras de negócio
    - Casos de uso
    - Critérios de aceitação
    - Cenários de erro
- Não iniciar desenvolvimento sem esses insumos

## 1. Definição de contrato
- Criar tipos/interfaces compartilhados em `packages/utils/src/`
- Exportar via `@repo/utils`

## 2. Testes primeiro (TDD obrigatório)
- Criar testes unitários ANTES da implementação
- Backend:
  - Testar regras de negócio (services)
  - Testar cenários de erro (BusinessException)
- Frontend:
  - Testar comportamento dos componentes
  - Testar formulários (validação, estados)
- Os testes devem refletir diretamente as regras de negócio fornecidas

## 3. Implementação Backend (NestJS)
- Criar módulo por domínio em `apps/backend/src/`
  - module
  - controller
  - service
  - dto
- Aplicar:
  - DTOs com validação
  - lógica no service
  - controller apenas orquestra
  - uso obrigatório de `BusinessException`
- Exceções:
  - usar apenas `BusinessException` para regra de negócio
  - conter código interno + HTTP code (default 400)
- Tratamento global via `ExceptionFilter`

## 4. Implementação Frontend (Angular)
- Criar componentes em `apps/frontend/src/app/`
- Seguir padronização obrigatória:
  - `entity-list`
  - `entity-form`
  - `entity-detail`
  - `entity-filter` (quando aplicável)
- Usar:
  - Reactive Forms
  - Signals + computed()
  - TailwindCSS
- Separar:
  - container vs presentational

## 5. Integração
- Consumir backend via HttpClient
- Nunca acessar lógica diretamente no frontend

## 6. Validação final (OBRIGATÓRIO)
- Executar TODOS os testes unitários após implementação
- Garantir:
  - 100% dos testes relacionados à regra de negócio passam
  - Nenhuma regressão foi introduzida
- Caso algum teste falhe:
  - Corrigir implementação (não o teste, salvo erro claro)
- A entrega só é válida com todos os testes passando