# TASKS - Conecta Indicadores MVP

## Fase 1 - Fundação

- [X] 1.1 Estrutura monorepo (pastas raiz)
- [X] 1.2 Docker Compose (web, api, postgres)
- [X] 1.3 PostgreSQL config
- [X] 1.4 NestJS backend scaffolding
- [X] 1.5 Next.js frontend scaffolding
- [X] 1.6 Variáveis de ambiente (.env)

## Fase 2 - Banco

- [X] 2.1 Prisma schema (Municipality, FiscalIndicator, DeliveryStatus)
- [X] 2.2 Prisma migrations
- [X] 2.3 Seeds (dados municipais)

## Fase 3 - Integração SICONFI

- [X] 3.1 Cliente HTTP SICONFI com rate limit
- [X] 3.2 Serviço de sincronização (entes, rreo, rgf, entregas)
- [X] 3.3 Cron job diário (02:00)
- [X] 3.4 Logs de sincronização

## Fase 4 - API

- [X] 4.1 GET /municipalities/{ibgeCode}/dashboard
- [X] 4.2 GET /comparison
- [X] 4.3 GET /ranking
- [X] 4.4 GET /municipalities/{ibgeCode}/deliveries

## Fase 5 - Frontend

- [X] 5.1 Layout (sidebar + header)
- [X] 5.2 Página Dashboard (/)
- [X] 5.3 Página Comparativo (/comparison)
- [X] 5.4 Página Ranking (/ranking)
- [X] 5.5 Página Entregas (/deliveries)

## Fase 6 - Qualidade

- [X] 6.1 Testes backend
- [X] 6.2 Testes frontend
- [X] 6.3 Docker build validation
- [X] 6.4 TypeScript/ESLint check
