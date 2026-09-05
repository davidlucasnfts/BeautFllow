# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 04/09/2026
> **Sessão atual:** Correção do auth local (login/logout) + favicon + regra global de teste local antes de produção

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Drizzle ORM + Supabase (PostgreSQL) + Vercel

---

## Última funcionalidade trabalhada
**Correção do fluxo de auth local + favicon + regra global de fluxo local → produção** — 04/09

### O que mudou nesta sessão:
1. **Bug crítico corrigido** — login/logout local davam 500 `c.header is not a function` (ctx tRPC passado para `setCookie` do Hono). Agora o cookie é serializado com `cookie.serialize` e escrito em `ctx.resHeaders` (mesmo padrão do `auth-router.ts`)
2. **Fluxo validado de ponta a ponta** — register → login → me → logout → me (null), tudo via API no servidor local
3. **Favicon criado** — `app/public/favicon.svg` + link no `index.html` (eliminava o 404 do console)
4. **Regra global nova** — MestreProjects.md seção 9: sempre testar local antes de produção (referenciada no AGENTS.md)
5. **AGENTS.md sincronizado** — estrutura de diretórios e regras técnicas agora refletem `server/` (backend migrou de `api/` nesta sessão)
6. Deploy de produção `studioflow-navy.vercel.app` funcional (3 deploys Ready)
7. **OAuth Kimi removido do app** — router `auth-router.ts`, queries OAuth mortas (`queries/users.ts`), fallback no `useAuth.ts`, plugin `kimi-plugin-inspect-react`, env vars `APP_ID`/`OWNER_UNION_ID`/`VITE_APP_ID`/`KIMI_*`. Cookie de sessão renomeado `kimi_sid` → `studioflow_sid`. App 100% independente de plataforma (regra do AGENTS.md)

### Arquivos modificados nesta sessão:
- `app/server/local-auth-router.ts` — correção do cookie (login/logout)
- `app/server/auth-router.ts` — **deletado** (OAuth legado)
- `app/server/queries/users.ts` — **deletado** (só usado pelo OAuth)
- `app/server/router.ts` — registro do `authRouter` removido
- `app/server/boot.ts` — rate limit de `/api/trpc/auth.*` removido
- `app/server/lib/env.ts` — `appId` e `ownerUnionId` removidos
- `app/src/hooks/useAuth.ts` — fallback OAuth removido
- `app/contracts/constants.ts` — `oauthCallback` removido; cookie renomeado
- `app/vite.config.ts` — plugin `kimi-plugin-inspect-react` removido
- `app/package.json` — dependência `kimi-plugin-inspect-react` removida
- `app/vitest.config.ts` — `contracts/**` incluído nos testes
- `app/.env.example` — vars OAuth removidas
- `app/public/favicon.svg` — criado
- `app/index.html` — link do favicon
- `app/api/index.js` — bundle regenerado (sem OAuth)
- `AGENTS.md` — regra de fluxo local → produção + sincronização `server/`
- `MestreProjects.md` — regra global de fluxo local → produção (fora do repo)

---

## Consolidação dos arquivos mestre — 05/09

A pasta `PROJETOS IA` tinha 3 fontes de regras globais: `MestreProjects.md`, a pasta fatiada `MestreProjects/` (13 arquivos) e `MASTER_NOVO_PROJETO.md` (template). Consolidado tudo no `MestreProjects.md` (v2.0.0, seções 15 e 16 novas + tabela de 20 erros no Self-Healing). Originais arquivados em `PROJETOS IA/_arquivamento-2026-09/` — David pode apagar a pasta quando conferir.

---

## Funcionalidade entregue nesta sessão
**Correção do auth local (login/logout) + favicon + regra de fluxo local → produção** — 04/09

---

## Próximo passo definido
**Validar com David no navegador local (cadastro → login → dashboard), depois subir para produção:**
1. David testa o fluxo completo local (`npm run dev`): cadastro, login, logout
2. Testar cadastro/login em produção (`https://studioflow-navy.vercel.app`) — deploy automático a cada push
3. Cobrar redirect URL do OAuth Kimi e destino do projeto Vercel antigo

Próximas funcionalidades (após validação):
- Landing pages específicas por segmento (`/salao-de-beleza`, `/barbearia`, `/estetica`)
- Templates de comunicação usados nas mensagens automáticas

---

## Bloqueios
Nenhum.

---

## Estrutura de pastas (resumida)
```
app/
  src/           → Frontend React (pages, components, hooks, providers)
  server/        → Backend tRPC/Hono (routers, middleware, context, lib/audit.ts)
  api/           → Entrypoint serverless Vercel (só index.js, bundle gerado)
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
- [x] Verificar disponibilidade de domínio `studioflow.com.br` — **disponível**
- [x] Rodar migration 003-salon-segment.sql no Supabase
- [x] Criar novo projeto Vercel `studioflow` com env vars (CORS_ORIGIN=https://studioflow-navy.vercel.app)
- [x] Commit + push de todo o código local (estava só no PC desde agosto)
- [x] Corrigir erro de build Vercel (backend migrado para `server/`, entrypoint `api/index.js` bundle esbuild, versionado no Git)
- [x] Reativar projeto Supabase (estava pausado) + rodar migration 003
- [x] Corrigir fluxo de login/logout local (cookie em `ctx.resHeaders`)
- [x] **Remover OAuth Kimi do app** (aprovado por David) — elimina a pendência da redirect URL no painel Kimi
- [ ] **Remover env vars `APP_ID` e `OWNER_UNION_ID` do projeto Vercel `studioflow`** (Settings → Environment Variables) — não são mais lidas pelo código. `APP_SECRET` e `DATABASE_URL` **permanecem**
- [ ] **Testar cadastro/login em `https://studioflow-navy.vercel.app`** após o push destas correções
- [ ] **Decidir o que fazer com o projeto Vercel antigo (`beaut-flow`)** — desconectar Git ou deletar (conflita no mesmo repo, deploya a cada push)
- [ ] Renomear repositório GitHub `BeautFllow` → `studioflow` (opcional)
- [ ] Comprar domínio `studioflow.com.br` e configurar na Vercel (quando preparar para vender)
- [ ] Adicionar `SENTRY_DSN` e `VITE_SENTRY_DSN` na Vercel (opcional — só se quiser usar)
- [ ] Apagar usuário de teste `teste.kimi.2026@gmail.com` na tabela `local_users` do Supabase (opcional)

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
