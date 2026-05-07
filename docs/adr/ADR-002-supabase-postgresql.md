# ADR-002: Supabase PostgreSQL como Database Principal

**Data:** 2026-05-06
**Status:** Aceita
**Decisores:** David Lucas (Product Owner), Kimi Code (Implementacao)

## Contexto

Inicialmente o projeto usava MySQL (template base). Avaliamos migrar para PostgreSQL/Supabase para aproveitar recursos como RLS, Realtime e pgvector.

## Decisao

Migrar de MySQL para PostgreSQL hospedado no Supabase.

## Alternativas Consideradas

| Alternativa | Pros | Contras |
|-------------|------|---------|
| MySQL (PlanetScale) | Git-like branches, escala automatica | Sem RLS nativo, mais caro |
| PostgreSQL auto-hospedado | Controle total | Overhead de infra, backups manual |
| Neon | Serverless PostgreSQL, branching | Menos recursos que Supabase |
| Supabase | RLS, Realtime, Auth, Storage, gratis ate 500MB | Vendor lock-in parcial |

## Consequencias

**Positivas:**
- RLS (Row Level Security) para multi-tenancy nativo
- Realtime subscriptions (notificacoes em tempo real futuras)
- Backups automaticos
- Storage integrado para imagens
- pgvector para busca semantica futura

**Negativas:**
- Migraacao do schema e queries necessaria
- Vendor lock-in parcial (mas PostgreSQL e padrao, portavel)

**Riscos:**
- Limite de 500MB no free tier (mitigado: dados de salao sao pequenos)
