# BeautyFlow — Histórico de Entregas

SaaS multi-tenant de gestão para salões de beleza. React 19 + TypeScript + Vite + Tailwind + shadcn/ui + tRPC/Hono + Drizzle ORM + PostgreSQL (Supabase) + Vercel.

> **Para contexto da sessão atual, ver `SESSION-CONTEXT.md`**
> **Para regras de desenvolvimento, ver `AGENTS.md`**
> **Para guia completo do projeto, ver `MestreBeaut.md`**
> **Para estrutura de documentação, ver `docs/documentacao-estrutura.md`**

---

## ✅ Entregues

| Funcionalidade | Data |
|---|---|
| Auth OAuth 2.0 Kimi + JWT sessions | — |
| Auth local (email + senha) | — |
| Multi-tenancy (salonId isolamento) | — |
| Dashboard com KPIs | — |
| CRM Clientes (CRUD, segmentação, LGPD) | — |
| Catálogo de Serviços | — |
| Profissionais (comissão, horários) | — |
| Agendamentos (calendário semana/dia) | — |
| Financeiro (lançamentos, comissões) | — |
| Comunicação Omnichannel (estrutura) | — |
| Termos LGPD + assinatura digital | — |
| Landing Page | — |
| Audit logs em operações críticas | — |
| Rate limiting (100 req/min IP, 5 req/min auth) | 12/05 |
| Husky + lint-staged (pre-commit/pre-push) | 12/05 |
| MestreBeaut.md (guia completo do projeto) | 12/05 |
| Conexão DB recria quando DATABASE_URL muda | 12/05 |
| Appointments.tsx refatorado (< 400 linhas) | 12/05 |
| PRD + 3 User Stories (RF-001 a RF-003) | 12/05 |
| CI/CD com deploy Vercel | 12/05 |
| ESLint strict mode | 12/05 |
| Migrations organizadas (001-002) + schema_safe.sql | 12/05 |
| RLS policies habilitadas no Supabase | 12/05 |

---

## 📝 Resumo da Sessão 12/05 — Alinhamento Completo com Padrão Mestre

### Documentação criada
- **`MestreBeaut.md`** — guia completo do projeto (adaptado do MestreProjects.md)
- **`docs/documentacao-estrutura.md`** — mapa de onde salvar cada tipo de informação
- **`docs/adr/ADR-005-seguranca-padrao.md`** — decisão arquitetural de segurança
- **`docs/requirements/PRD.md`** — Product Requirements Document
- **`docs/requirements/RF-001-auth.md`** — User Story: Autenticação
- **`docs/requirements/RF-002-clientes.md`** — User Story: CRM Clientes
- **`docs/requirements/RF-003-agendamentos.md`** — User Story: Agendamentos

### Correções de segurança
| Severidade | Problema | Correção |
|---|---|---|
| 🟠 ALTO | Rate limiting não implementado | `hono-rate-limiter` em `api/boot.ts` |
| 🟠 ALTO | Conexão DB não recria quando URL muda | `currentDatabaseUrl` track em `connection.ts` |
| 🟡 MÉDIO | Appointments.tsx > 400 linhas | Quebrado em 4 arquivos (236 linhas) |
| 🟡 MÉDIO | ESLint modo recommended (não strict) | `tseslint.configs.strict` |
| 🟡 MÉDIO | CI/CD sem job deploy | Adicionado job `deploy` com Vercel |
| 🟢 BAIXO | .env.example mencionava MySQL | Atualizado para PostgreSQL |

### Migrations organizadas
- `supabase/migrations/001-schema-inicial.sql` — schema base (245 linhas)
- `supabase/migrations/002-rls-policies.sql` — RLS + policies (72 linhas)
- `supabase/schema_safe.sql` — consolidado idempotente (317 linhas)

---

## 📋 Backlog
- Testes unitários (meta 80% cobertura)
- Sentry (error tracking)
- Relatórios PDF/CSV
- Agenda online pública
- Campanhas automáticas de reativação
- App mobile / PWA
