# ADR-003: Vercel como Plataforma de Deploy

**Data:** 2026-05-05
**Status:** Aceita
**Decisores:** David Lucas (Product Owner)

## Contexto

BeautyFlow precisa de deploy rapido, confiavel e com custo zero para o MVP. O frontend e SPA e o backend roda como serverless functions.

## Decisao

Usar Vercel como plataforma de deploy unificada (frontend + backend).

## Alternativas Consideradas

| Alternativa | Pros | Contras |
|-------------|------|---------|
| Vercel | Serverless, CDN global, preview deploys, gratis | Cold starts, limites de execucao |
| Railway | Deploy simples, banco integrado | Pago, menos otimizado para SPA |
| Render | Preco justo, persistente | Cold starts maiores |
| AWS Amplify | Integracao AWS | Complexidade, custo imprevisivel |

## Consequencias

**Positivas:**
- Deploy em segundos via git push
- Preview deployments para cada PR
- CDN global automatico
- Gratis para projetos pessoais/hobby

**Negativas:**
- Cold starts em functions serverless
- Limite de 10s de execucao (hobby plan)
- Nao e ideal para workloads long-running

**Riscos:**
- Escalabilidade: se o SaaS crescer, pode ser necessario migrar para infra dedicada
- Vendor lock-in: mitigado por usar Hono (portavel) e PostgreSQL (padrao)
