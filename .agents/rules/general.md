# Monorepo — Regras Globais
- Stack: Nest.js 11 (apps/backend), Angular 20+ (apps/dashboard)
- Gerenciador: pnpm workspaces + Turborepo
- TypeScript strict em todos os pacotes
- Shared code exclusivamente em packages/
- Nunca importar de apps/ dentro de packages/
- Conventional commits: feat(backend):, feat(frontend):, fix(utils):
- Sempre utilize os principios de Cleancode, com enfoque no SRP (Single Responsability Principle)
- Sempre utilize os principios de CleanArchitecture
