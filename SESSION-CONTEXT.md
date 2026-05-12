# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 12/05/2026
> **Sessão atual:** Alinhamento com padrão mestre + MestreBeaut.md + Ações manuais concluídas

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Drizzle ORM + Supabase (PostgreSQL) + Vercel

---

## Última funcionalidade trabalhada
**Alinhamento Completo com Padrão Mestre + Ações Manuais** — 12/05

### O que mudou nesta sessão:
1. **MestreBeaut.md criado** — guia completo adaptado do MestreProjects.md
2. **Rate limiting** — 100 req/min por IP, 5 req/min em auth endpoints
3. **Husky + hooks** — pre-commit (lint+check), pre-push (test+build)
4. **Conexão DB inteligente** — recria quando DATABASE_URL muda
5. **Appointments.tsx refatorado** — de 462 para 236 linhas (4 componentes)
6. **PRD + 3 User Stories** — RF-001 (Auth), RF-002 (Clientes), RF-003 (Agendamentos)
7. **CI/CD com deploy** — job deploy para Vercel no GitHub Actions
8. **ESLint strict** — `tseslint.configs.strict` aplicado
9. **Migrations organizadas** — padrão MandatoDigital (001-002 + schema_safe.sql)
10. **RLS habilitado** — policies de isolamento por salão no Supabase
11. **Testes unitários** — 24 testes em 3 arquivos
12. **Sentry configurado** — @sentry/react + @sentry/node instalados
13. **Ações manuais concluídas** — VERCEL_TOKEN, env vars, RLS
14. **ROADMAP.md atualizado** — Fase 9 marcada como concluída

### Arquivos criados:
- `MestreBeaut.md` — guia completo do projeto
- `docs/documentacao-estrutura.md` — estrutura de documentação
- `docs/adr/ADR-005-seguranca-padrao.md` — ADR de segurança
- `docs/requirements/PRD.md` — Product Requirements Document
- `docs/requirements/RF-001-auth.md` — User Story: Autenticação
- `docs/requirements/RF-002-clientes.md` — User Story: CRM Clientes
- `docs/requirements/RF-003-agendamentos.md` — User Story: Agendamentos
- `docs/runbooks/processos-manuais.md` — 7 processos manuais documentados
- `supabase/migrations/001-schema-inicial.sql` — migration base
- `supabase/migrations/002-rls-policies.sql` — migration RLS
- `supabase/schema_safe.sql` — schema consolidado idempotente
- `src/components/appointments/AppointmentFilters.tsx` — filtros do calendário
- `src/components/appointments/AppointmentDialog.tsx` — modal de novo agendamento
- `src/components/appointments/useAppointmentForm.ts` — hook do formulário
- `api/lib/__tests__/rate-limit.test.ts` — testes de rate limiting
- `api/lib/__tests__/security-utils.test.ts` — testes de segurança
- `src/lib/__tests__/utils.test.ts` — testes de utilitários

### Arquivos modificados:
- `AGENTS.md` — regras completas + self-healing + UX/UI
- `MEMORY.md` — histórico de entregas atualizado
- `ROADMAP.md` — Fase 9 concluída, registros atualizados
- `SESSION-CONTEXT.md` — estado atual (este arquivo)
- `app/api/boot.ts` — rate limiting + Sentry
- `app/api/queries/connection.ts` — recriação de conexão
- `app/src/pages/Appointments.tsx` — refatorado (< 400 linhas)
- `app/src/main.tsx` — Sentry frontend
- `.github/workflows/ci.yml` — job deploy Vercel
- `app/eslint.config.js` — modo strict
- `app/vitest.config.ts` — threshold 40%
- `app/.env.example` — PostgreSQL + Sentry

---

## Funcionalidade entregue nesta sessão
**Alinhamento Completo com Padrão Mestre + MestreBeaut.md + Ações Manuais** — 12/05

---

## Próximo passo definido
**Aguardando definição do David** — opções para próxima sessão:

1. **Relatórios PDF/CSV** — Faturamento por período, ocupação dos profissionais, serviços mais vendidos
2. **Agenda online pública** — Cliente agenda sem ligar para o salão
3. **Campanhas automáticas de reativação** — WhatsApp/SMS para clientes inativos
4. **Micro-interações UX** — Toasts, loaders, animações, feedback visual
5. **Testes adicionais** — Aumentar cobertura de testes
6. **Exportação de dados** — CSV/Excel de clientes, agendamentos, financeiro

---

## Bloqueios
Nenhum.

---

## Estrutura de pastas (resumida)
```
app/
  src/           → Frontend React (pages, components, hooks, providers)
  api/           → Backend tRPC/Hono (routers, middleware, context, lib/audit.ts)
  db/            → Schema Drizzle (schema.ts, relations.ts)
docs/            → ADRs + requirements + runbooks + DOR/DOD/LGPD
supabase/        → schema_safe.sql + migrations/ (001-002)
.github/         → Workflows CI/CD
```

---

## Decisões pendentes
- [x] Rodar migration 002 no Supabase (RLS policies)
- [x] Configurar `VERCEL_TOKEN` no GitHub Secrets
- [x] Configurar env vars na Vercel (DATABASE_URL, APP_ID, APP_SECRET, NODE_ENV, OWNER_UNION_ID)
- [x] Criar testes (24 testes, 3 arquivos, threshold 40%)
- [x] Sentry configurado (@sentry/react + @sentry/node)
- [ ] Adicionar SENTRY_DSN no Vercel (opcional — só se quiser usar)
- [ ] Escolher próxima funcionalidade do backlog

---

## Ações Manuais — REGRA PARA O KIMI
> Sempre que uma funcionalidade exigir ação manual (rodar SQL no Supabase, configurar secret no GitHub/Vercel, criar bucket, env var, etc.), **adicionar na seção "Decisões pendentes" acima** e **avisar David no final da resposta** com destaque em negrito e emoji ⚠️.

---

## Como atualizar este arquivo
No final de cada sessão, substitua:
1. **Data** no topo
2. **Última funcionalidade trabalhada** — o que foi feito
3. **Próximo passo definido** — o que faremos na próxima sessão
4. **Bloqueios** — se houver
5. **Decisões pendentes** — marcar como [x] quando concluído
