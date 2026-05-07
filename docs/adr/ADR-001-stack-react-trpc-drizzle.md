# ADR-001: Stack React 19 + tRPC + Drizzle ORM + Hono + PostgreSQL

**Data:** 2026-05-05
**Status:** Aceita
**Decisores:** David Lucas (Product Owner), Kimi Code (Implementacao)

## Contexto

BeautyFlow e um SaaS multi-tenant para saloes de beleza. Precisavamos de uma stack moderna, type-safe, rapida de desenvolver e com baixo custo operacional para o MVP.

## Decisao

Adotar:
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend:** Hono (HTTP framework) + tRPC (API type-safe) + Drizzle ORM
- **Database:** PostgreSQL via Supabase (iniciado com MySQL, migrado para PostgreSQL)
- **Auth:** OAuth 2.0 Kimi + JWT sessions
- **Deploy:** Vercel (serverless)

## Alternativas Consideradas

| Alternativa | Pros | Contras |
|-------------|------|---------|
| Next.js + Prisma | Full-stack framework, SSR nativo | Maior complexidade, vendor lock-in Vercel |
| Express + REST + Sequelize | Maior comunidade, mais tutoriais | Menos type-safe, mais boilerplate |
| Firebase | Zero backend, realtime | Vendor lock-in, custo sobe rapido |
| Supabase Auth + Row Level Security | Auth nativo, RLS automatico | Migracao futura do Kimi OAuth |

## Consequencias

**Positivas:**
- Type-safety end-to-end (tRPC + Drizzle + TypeScript)
- DX excelente — autocomplete em toda a stack
- Performance: Vite (build rapido), Hono (framework HTTP mais rapido do Node)
- Custo zero inicial: Vercel hobby + Supabase free tier

**Negativas:**
- tRPC exige conhecimento de TypeScript avancado
- Menos recursos de comunidade que Express/Prisma
- Supabase free tier limitado a 500MB

**Riscos:**
- Escalabilidade do Vercel serverless para workloads pesados
- Dependencia do Kimi OAuth (mitigado: JWT sessions permitem migracao futura)
