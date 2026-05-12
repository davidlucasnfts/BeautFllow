# ADR-005: Padrão de Segurança BeautyFlow

**Data:** 2026-05-12
**Status:** Aceita
**Decisores:** David Lucas (Product Owner)

## Contexto

O BeautyFlow lida com dados pessoais de clientes (CPF, telefone, histórico de serviços) e dados financeiros. Precisamos de um padrão de segurança consistente e verificável.

## Decisão

Adotar o padrão de segurança do `MestreProjects.md` (seção 2) como baseline, com as seguintes implementações:

| Regra | Implementação | Arquivo |
|-------|---------------|---------|
| Headers de segurança | CSP, HSTS, X-Frame, X-Content-Type | `api/boot.ts` |
| Rate limiting | 100 req/min IP, 5 req/min auth | `api/boot.ts` |
| Validação inputs | Zod em todos os routers tRPC | `api/*-router.ts` |
| RBAC | `authedQuery` + `adminQuery` | `api/middleware.ts` |
| RLS | `schema_safe.sql` com policies | `db/schema_safe.sql` |
| Audit logs | `auditAction()` em operações críticas | `api/lib/audit.ts` |
| npm audit | Falha em HIGH/CRITICAL | `.github/workflows/ci.yml` |
| TypeScript strict | `strict`, `noUnusedLocals` | `tsconfig.app.json` |

## Checklist Pré-Deploy

```
□ Nenhuma credencial hardcoded
□ Nenhum fallback de secret
□ RLS em todas as tabelas com PII
□ RBAC busca role do banco
□ Rate limiting ativo
□ Headers de segurança configurados
□ npm audit limpo
□ Audit logs funcionando
□ .env não está no git
```

## Consequências

**Positivas:**
- Segurança verificável e repetível
- Compliance LGPD nativo

**Trade-offs:**
- Rate limiting em memory (não distribuído) — OK para MVP, trocar para Redis quando escalar
