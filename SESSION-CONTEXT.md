# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 19/09/2026
> **Sessão atual:** Polimento das 5 páginas pendentes concluído — **app inteiro no padrão design system**; smoke test completo é o próximo passo antes do push

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Drizzle ORM + Supabase (PostgreSQL) + Vercel

---

## Última funcionalidade trabalhada
**Financeiro: filtros junto dos lançamentos + mês via DatePicker padrão** — 19/09 (na `main`)

### O que mudou (19/09, smoke test do David):
- **Financeiro:** filtro por período Dia/Semana/Mês (seletor igual ao da agenda; lista e cards de resumo usam o mesmo período) + correção de bug de fuso (coluna `date` exibida sem `new Date()`, que deslocava 1 dia pra trás — "01/09 aparecia como 31/08" e parecia fora de ordem) + helpers `toISODate`/`dateToBR` em `input-masks.ts`
- Busca + período saíram do cabeçalho e foram para dentro do card "Registros do mês" (o "+ Novo registro" ficou no cabeçalho, padrão das outras telas)
- Campo de mês trocou o input nativo `type="month"` (só abria no ícone) pelo `DatePicker` com `label` — campo inteiro clicável, mesmo padrão da agenda; troca de mês no calendário fecha o popup e aplica o filtro
- Regra nova no `AGENTS.md`: **sempre reusar padrões existentes aprovados antes de criar do zero**

### Smoke test → auditoria + correções (19/09, commits `c6b2747` + `cd4522b`):
- **Página pública de agendamento:** overbooking resolvido — sem preferência de profissional, o backend atribui automaticamente o primeiro livre (e bloqueia se todos ocupados); `availableSlots` ganhou `freeSlots` (slot só livre se ALGUM profissional estiver livre); `startTime` não pré-seleciona mais 09:00 e limpa ao trocar serviço/profissional/data; sem flicker "Sem horários" (`keepPreviousData`); datas passadas bloqueadas; estado vazio com aviso quando não há serviços ativos
- **Dashboard (crítico):** "hoje" calculado no SQL com `NOW() AT TIME ZONE 'America/Sao_Paulo'` — entre 21h–23h59 BRT o Dashboard mostrava o dia seguinte; SUM/COUNT do Postgres normalizados com `Number()` (KPI "R$ 3500.00" → "R$ 3.500,00")
- **Clientes:** limite da lista 100 → 1000 (cliente 101+ sumia da tela e da busca); data de nascimento limpável na edição (grava NULL); idade corrigida (perdia 1 dia no fuso); botão WhatsApp com texto
- **Comunicações/Termos:** horário das mensagens formatado no servidor com fuso BR (estava 3h atrasado); paginação "Carregar mais mensagens" (+50)
- **Geral:** `isError` tratado nas 5 páginas de listagem; Settings sem `type="number"`; comissão exibida como "10%"; `MessageFormDialog` valida cliente selecionado
- **Pendentes de decisão:** M6 (recálculo de segmentos de clientes roda 3x no Dashboard — mitigado com throttle de 60s; refactor pendente) e B5 (sparklines do Dashboard usam dados simulados) — avaliar com David
- **Hotfix 19/09 (`267304c`):** erro 500 do `customer.list` (cast `::date` no monthStart — regressão do C1, o type-check não pega erro de SQL); botão "Ver agenda" do Dashboard truncado no desktop (header do card em coluna); lentidão de carregamento — `refreshClientSegments` tinha throttle nenhum e UPDATEs sequenciais ao Supabase remoto em toda `customer.list` (7 telas) → throttle 60s/salão + invalidação nas mutations + UPDATEs paralelos

### Antes, nesta mesma sessão (19/09 — polimento das 5 páginas pendentes):
1. Auditoria página a página contra o design system: 5 ✅ já conformes (Agendamentos, Clientes, Serviços, Dashboard, Configurações), 5 ⚠️ melhoradas nesta sessão
2. **Financeiro:** editar/excluir lançamento (`financial.update`/`financial.delete` + audit), ficha expansível, moeda pt-BR
3. **Termos:** ver completo/editar/excluir (`consent.update`/`consent.delete` + audit; delete remove assinaturas vinculadas), checklist decorativo removido
4. **Profissionais:** ficha expansível, desativar/reativar (soft delete), busca, input de horários de trabalho
5. **Comunicação:** reenviar (form pré-preenchido)/excluir (`communication.delete` + audit), ficha expansível
6. **Login/Cadastro:** ícones + toast pós-cadastro
7. Endpoints novos seguem padrão: Zod, filtro tenant, audit log

### Débitos técnicos percebidos (não urgentes):
- `server/queries/salon.ts` tem ~900 linhas (limite é 400) — quebrar em `queries/financial.ts`, `queries/consent.ts` etc.
- `consent.create` aceita `serviceId` no Zod mas a tabela não tem a coluna (campo morto, nenhuma tela envia)
- Sem FK de `consent_signatures.formId` → `consent_forms.id` no schema
- `financial.create` exige `clientId` mas o schema permite null (despesa genérica sem cliente não é possível)
- Decisão LGPD pendente: delete de termo apaga assinaturas (exclusão física). Se a LGPD exigir retenção, migrar para exclusão lógica (`isActive` já existe)

### Próximo passo definido:
1. David roda o **smoke test completo** (roteiro da sessão: login → profissional → serviço → cliente → agendar → concluir c/ pagamento → conferir financeiro) — agora com todas as páginas polidas
2. Se passar: **push autorizado** → `main` remota → Vercel deploya
3. Validar cadastro/login em produção (`studioflow-navy.vercel.app`)
4. Depois: Fase 4 (billing Stripe/Mercado Pago + landings por segmento + preços)

### Como testar local:
`cd app && npm run dev` → `http://localhost:3000`

---

## Stack (1 linha)
React 19 + TypeScript strict + Tailwind + shadcn/ui + tRPC/Hono + Drizzle ORM + Supabase (PostgreSQL) + Vercel

---

## Última funcionalidade trabalhada
**Agendamentos — Opção 5 + filtros reais + alerta de pendentes** — 15/09 (na `main`, commit `9b748b6`)

### O que mudou nesta sessão (15/09):
1. **Mockup navegável** `docs/mockups/agendamento-seletor-visao.html` — 5 opções renderizadas; David escolheu e aprovou a **Opção 5**
2. **Nova regra no AGENTS.md** — "Visualização externa de propostas": sempre que David pedir pra visualizar algo (botão, funcionalidade, tela), gerar HTML navegável em `docs/mockups/`, nunca só texto no chat
3. **Layout Opção 5** — `[Dia][Semana][Mês]` + Novo em uma linha; navegação `‹ [rótulo ▾] ›` com centro clicável (pula pro dia/semana/mês escolhido); **chips de profissional com cor** em dia/semana (mobile + desktop); botão **Hoje** reseta a navegação
4. **Fix real:** filtro por profissional/serviço **não funcionava na fila do dia (mobile)** — recebia atendimentos brutos; agora recebe filtrados
5. **Visão Mês simplificada** — só o dia + badge com quantidade de atendimentos (chips de horário não cabiam no mobile)
6. **Alerta de pendentes** (novo `PendingPastAlert`) — na visão Dia, aviso âmbar com atendimentos dos últimos 90 dias sem concluir/cancelar, respeitando o filtro ativo; botão "Ver dia" leva ao mais antigo
7. **Fila mobile:** ponto indicador nos dias que têm atendimento do filtro atual (clicar no chip mostra onde aquele profissional atende)
8. **Refactor:** seleção de visões extraída da página pra `AgendaViews.tsx` (`Appointments.tsx` estourava o limite de 400 linhas)

### Como testar local:
`cd app && npm run dev` → `http://localhost:3000` → Agendamentos → testar as 3 visões no iPhone 12 Pro e desktop: chips filtram, mês mostra contagem, alerta de pendentes aparece se houver atendimento antigo sem concluir/cancelar

---

## Consolidação dos arquivos mestre — 05/09

## Última funcionalidade trabalhada
**Página de Clientes — ficha expandida + status híbrido dos clientes** — 08/09

### O que mudou nesta sessão (08/09):
1. **Lista de clientes padrão Fila do Dia** — ficha expande na linha (sem trocar de tela), WhatsApp com ícone oficial na lateral, Excluir só dentro do card aberto
2. **Ficha completa** — Aniversário dd/mm + idade, Última visita, Histórico recente de atendimentos (endpoint novo `appointment.historyByClient`)
3. **Status híbrido dos clientes** — regras automáticas configuráveis em Configurações (VIP por R$ gasto ou nº de atendimentos no mês, dias p/ Sumindo/Inativo) + seletor manual "Automático/Novo/Ativo/VIP/Sumindo/Inativo" no editar do cliente (`segmentManual`, migration 007)
4. **Totais reais** — `totalVisits`, `totalSpent` e `lastVisitAt` são recalculados dos agendamentos concluídos sempre que a lista carrega (antes ficavam zerados)
5. **Renomeação "Visitas" → "Atendimentos"** nas telas de cliente
6. **Fix Tailwind v4→v3** nos componentes shadcn (sidebar fixa não cobria mais o conteúdo)

### Sessão anterior (05/09):
1. **AGENTS.md ganhou 8 padrões copiados do MandatoDigital** (commit f6c56b0): checklist pré-commit obrigatório, padrão de páginas de teste (V2/V3), padrão de preview/detalhes (ficha do item selecionado), abas/filtros, cards h-full + grids simétricos, mobile-first responsivo obrigatório, regra de senha PostgreSQL sem caracteres especiais
2. **Auditoria de design executada** — achados pendentes de aplicação:
   - `Clients.tsx`, `Services.tsx`, `Professionals.tsx` usam botões de ícone sozinhos (ghost, Edit3/Trash2 sem texto) — violam a regra "sempre texto + ícone" do próprio design system
   - Cards dos grids sem `h-full` (alturas podem diferir)
   - Dialogs sem `w-full max-h-[80vh] overflow-y-auto`
   - Nenhuma página tem preview/ficha expandida — melhoria #2 priorizada (ficha do cliente + WhatsApp) deve seguir o novo padrão de preview

### Sessão anterior (04/09):
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
- [x] **Deletar o projeto Vercel antigo (`beaut-flow`)** — deletado por David no painel Vercel em 06/09
- [ ] **Foto do estabelecimento no perfil** (coluna `logoUrl` já existe no banco) — falta criar bucket no Supabase Storage e implementar o upload na aba Configurações
- [ ] Renomear repositório GitHub `BeautFllow` → `studioflow` (opcional)
- [ ] Comprar domínio `studioflow.com.br` e configurar na Vercel (quando preparar para vender)
- [ ] Adicionar `SENTRY_DSN` e `VITE_SENTRY_DSN` na Vercel (opcional — só se quiser usar)
- [x] Rodar migration 006-remove-client-cpf-email.sql no Supabase (SQL Editor) — remove CPF e e-mail do cadastro de cliente. O app já funciona sem esses campos antes da migration; ela só apaga as colunas
- [x] Rodar migration 005-rls-salons.sql no Supabase (SQL Editor) — fecha lacuna: tabela `salons` estava sem RLS. App não é afetado (backend acessa como owner), mas testar o fluxo local depois
- [ ] Apagar usuário de teste `teste.kimi.2026@gmail.com` na tabela `local_users` do Supabase (opcional)
- [x] Rodar migration 007-client-segment-manual.sql no Supabase — **aplicada pelo Kimi direto no banco em 09/09** (coluna `segmentManual` na tabela `clients`). Sem ela, listagem e cadastro de clientes quebravam com erro 500

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
