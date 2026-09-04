# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 24/08/2026
> **Sessão atual:** Renomeação para StudioFlow + segmentação por tenant (salão, barbearia, estética)

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Drizzle ORM + Supabase (PostgreSQL) + Vercel

---

## Última funcionalidade trabalhada
**Decisão de estratégia de produto: 3 segmentos + renomeação do app** — 24/08

### O que mudou nesta sessão:
1. **Renomeação concluída** — `BeautyFlow` → `StudioFlow` em código, documentação e metadados
2. **Segmentação implementada** — campo `segment` em `salons` com 3 valores: `beauty_salon`, `barbershop`, `aesthetic_clinic`
3. **Migration 003** — `supabase/migrations/003-salon-segment.sql` + `schema_safe.sql` atualizado
4. **Backend segmentado** — `salon-router.ts` aceita segmento no create/update
5. **Onboarding novo** — `CreateSalonForm.tsx` com seleção de segmento e serviços sugeridos
6. **Labels dinâmicos** — Dashboard, Clientes, Serviços e Profissionais usam termos por segmento
7. **Landing page segmentada** — `Home.tsx` com seletor de segmento e copy adaptada
8. **Helpers de segmento** — criados em `app/contracts/segment-*.ts`
9. **Paleta por segmento** — landing page, CTA e onboarding usam cores do segmento
10. **Landing page 100% segmentada** — seções "Como funciona" e "Prova social" adaptam copy por segmento
11. **Ajustes de consistência** — `package-lock.json` renomeado, textos fixos com "salão" generalizados para "negócio"
12. **Cores dinâmicas na landing page** — variáveis CSS `--primary`, `--secondary`, `--accent` mudam por segmento
13. **Validação técnica** — `npm run quality` e `npm run build` passando

### Arquivos criados:
- `MestreStudioFlow.md` — renomeado a partir de `MestreBeaut.md`
- `app/contracts/segment-labels.ts` — labels por segmento
- `app/contracts/segment-palettes.ts` — paletas por segmento
- `app/contracts/segment-services.ts` — templates de serviços por segmento
- `app/contracts/segment-messages.ts` — templates de mensagens por segmento
- `app/src/components/CreateSalonForm.tsx` — onboarding com seleção de segmento
- `supabase/migrations/003-salon-segment.sql` — migration de segmento

### Arquivos modificados:
- Toda documentação e código — `BeautyFlow` → `StudioFlow`
- `app/db/schema.ts` — adicionado `salonSegmentEnum` e coluna `segment` em `salons`
- `app/api/salon-router.ts` — segmento no create/update
- `app/src/providers/salon.tsx` — `SalonContextType` com `segment`
- `app/src/components/AuthLayout.tsx` — onboarding quando sem salão, menu dinâmico
- `app/src/pages/Dashboard.tsx` — labels dinâmicos
- `app/src/pages/Services.tsx` — labels dinâmicos
- `app/src/pages/Clients.tsx` — labels dinâmicos
- `app/src/pages/Professionals.tsx` — labels dinâmicos
- `app/src/pages/Home.tsx` — seletor de segmento na landing page
- `app/src/components/landing/CTASection.tsx` — copy por segmento
- `app/index.html` — metadados atualizados
- `supabase/schema_safe.sql` — migration 003 incluída
- `MEMORY.md` — histórico atualizado
- `SESSION-CONTEXT.md` — estado atual (este arquivo)

---

## Funcionalidade entregue nesta sessão
**Decisão estratégica de produto + plano de renomeação/segmentação** — 24/08

---

## Próximo passo definido
**Ações manuais pendentes para finalizar renomeação e segmentação:**

1. Verificar disponibilidade do domínio `studioflow.com.br` / `studioflow.com`.
2. Rodar migration `003-salon-segment.sql` no Supabase.
3. Configurar `CORS_ORIGIN` na Vercel com a URL de produção real.
4. Deploy.

Após isso, próximas funcionalidades:
- Landing pages específicas por segmento (`/salao-de-beleza`, `/barbearia`, `/estetica`)
- Paleta de cores aplicada por segmento no onboarding
- Templates de comunicação usados nas mensagens automáticas

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
supabase/        → schema_safe.sql + migrations/ (001-003)
.github/         → Workflows CI/CD
```

---

## Decisões pendentes
- [x] Rodar migration 002 no Supabase (RLS policies)
- [x] Configurar `VERCEL_TOKEN` no GitHub Secrets
- [x] Configurar env vars na Vercel (DATABASE_URL, APP_ID, APP_SECRET, NODE_ENV, OWNER_UNION_ID)
- [x] Criar testes (24 testes, 3 arquivos, threshold 40%)
- [x] Sentry configurado (@sentry/react + @sentry/node)
- [x] Escolher novo nome do app: **StudioFlow**
- [ ] **Verificar disponibilidade de domínio** para `studioflow.com.br` / `studioflow.com`
- [ ] **Rodar migration 003-salon-segment.sql no Supabase**
- [ ] Adicionar `CORS_ORIGIN` na Vercel com a URL de produção real (ex: `https://studioflow.vercel.app`)
- [ ] Adicionar `SENTRY_DSN` e `VITE_SENTRY_DSN` na Vercel (opcional — só se quiser usar)

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
