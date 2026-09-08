# StudioFlow — Histórico de Entregas

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
| Correções de alinhamento com padrão mestre (MestreBeaut.md, AGENTS.md, any, CORS, format) | 24/08 |
| Decisão de estratégia: foco em 3 segmentos + renomeação do app | 24/08 |
| Plano de renomeação e segmentação criado | 24/08 |
| Renomeação concluída: BeautyFlow → StudioFlow | 24/08 |
| Segmentação por tenant implementada (salão, barbearia, estética) | 24/08 |
| Onboarding com seleção de segmento | 24/08 |
| Landing page com seletor de segmento | 24/08 |
| Paleta de cores por segmento na landing page | 24/08 |
| Paleta de cores por segmento no onboarding | 24/08 |
| Landing page 100% segmentada (como funciona, prova social, copy) | 24/08 |
| Ajustes de consistência pós-renomeação (package-lock, textos) | 24/08 |
| Variáveis CSS dinâmicas por segmento na landing page | 24/08 |
| Correção do deploy Vercel (entrypoint serverless pré-compilado) | 04/09 |
| Migração do backend `api/` → `server/` (build Vercel, histórico Git preservado) | 04/09 |
| Correção do login/logout local (cookie escrito em `ctx.resHeaders`) | 04/09 |
| Favicon StudioFlow (`public/favicon.svg`) | 04/09 |
| Remoção do OAuth Kimi — app 100% independente (router, plugin, env vars) | 04/09 |
| Padrões do MandatoDigital copiados para o AGENTS.md (checklist pré-commit, páginas de teste, preview, mobile-first) | 05/09 |
| Cards com alturas iguais (h-full) + scroll em todos os dialogs | 05/09 |
| Botões de ação com texto + ícone nas cores do design system (Clientes, Serviços, Profissionais) | 05/09 |
| Ficha do cliente ao clicar no card — detalhes + botão WhatsApp + ações (padrão preview) | 05/09 |
| Confirmação obrigatória antes de excluir (AlertDialog com nome do item) — regra #006 no AGENTS.md | 06/09 |
| Card do cliente: expansão inline, setinha centralizada, WhatsApp na lateral, botões preenchidos | 06/09 |
| Grade de horários padrão 30 em 30 min (07h–21h) — config central em `contracts/constants.ts` | 06/09 |
| Agendamento online e interno: só mostra horários livres (ocupados somem); horários passados escondidos | 06/09 |
| Fix: campo de horário não fica mais travado no agendamento online (grade só aparece com serviço + data) | 06/09 |
| Configuração de horário por estabelecimento: aba Configurações (abre/fecha, intervalo 30/60) salva em `salons.settings` | 06/09 |
| Card do cliente compacto: Excluir só aparece dentro do card aberto (menos chance de apagar sem querer) | 06/09 |
| Tema primário global azul-600 (design system) + avatar com inicial na cor do segmento + "Cliente desde" + campo tags no form | 06/09 |
| Catálogo de 9 temas (3 por segmento) com escolha do proprietário em Configurações — aplica no painel e no link de agendamento (estética deixou de ser verde → lilás) | 06/09 |
| Widget Aniversariantes do mês na Dashboard (Fase 1) | 06/09 |
| Ciclo da agenda completo: Concluir com check-out financeiro vinculado, board "Agendamentos de hoje" na Dashboard, cancelar com confirmação | 07/09 |
| Ciclo da agenda: `Agendado → (Iniciar) → Em andamento → (Concluir) → Completo`, com Cancelar até o fim (outline); removido "Confirmar"; badge "Chegou" virou "Em andamento" na cor do tema; DatePicker calendário em todos os campos de data; ações da fila do dia compactas alinhadas à direita | 08/09 |

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

## 📝 Resumo da Sessão 24/08 — Reanálise e Correções de Alinhamento

### Documentação atualizada
- **`MestreBeaut.md`** → **`MestreStudioFlow.md`** — status sincronizados com código real
- **`AGENTS.md`** — regra de segurança padronizada
- **`SESSION-CONTEXT.md`** — estado atual e decisões pendentes atualizados

### Correções técnicas
| Severidade | Problema | Correção |
|---|---|---|
| 🟠 ALTO | `MestreBeaut.md` desatualizado em relação ao código | Status revisados e sincronizados |
| 🟡 MÉDIO | Uso de `any` em `app/api/lib/http.ts` | Substituído por `unknown` + type guard |
| 🟡 MÉDIO | URL de produção hardcoded no CORS | Movida para variável `CORS_ORIGIN` |
| 🟢 BAIXO | ESLint warnings em `coverage/` | Pasta adicionada ao `.eslintignore` |
| 🟢 BAIXO | Warnings de fast refresh em providers | Desabilitada regra específica nesses arquivos |
| 🟢 BAIXO | Código fora do padrão Prettier | Executado `npm run format` |

### Validação
- ✅ `npm run quality` passando (lint + type-check + testes + format-check)
- ✅ `npm run build` passando

---

## 📝 Resumo da Sessão 24/08 — Renomeação e Segmentação

### Decisões
- **Novo nome:** StudioFlow
- **Segmentos:** Salão de Beleza, Barbearia, Clínica de Estética

### Documentação
- Renomeação de `MestreBeaut.md` para `MestreStudioFlow.md`
- Atualização de todos os arquivos de documentação e código
- Atualização do `docs/runbooks/rename-and-segmentation-plan.md`

### Backend
- Migration `003-salon-segment.sql` criada
- Coluna `segment` adicionada na tabela `salons`
- `salon-router.ts` atualizado para receber segmento no create/update
- `schema_safe.sql` atualizado

### Frontend
- `CreateSalonForm.tsx` — onboarding com seleção de segmento e serviços sugeridos
- `AuthLayout.tsx` — redireciona para onboarding quando não há salão
- `Dashboard.tsx`, `Services.tsx`, `Clients.tsx`, `Professionals.tsx` — labels dinâmicos por segmento
- `Home.tsx` — landing page com seletor de segmento
- `CTASection.tsx` — copy adaptada por segmento
- `index.html` — metadados atualizados

### Helpers de segmento
- `app/contracts/segment-labels.ts`
- `app/contracts/segment-palettes.ts`
- `app/contracts/segment-services.ts`
- `app/contracts/segment-messages.ts`

### Validação
- ✅ `npm run quality` passando
- ✅ `npm run build` passando
- ✅ 24 testes passando

---

## 📝 Resumo da Sessão 04/09 — Hardening do Deploy e Correção do Auth Local

### Deploy Vercel (produção viva)
- Backend migrado de `api/` para `server/` — a Vercel compilava todo `.ts` de `api/` com tsc node16 e quebrava o build
- `api/index.js` agora é bundle esbuild de `server/vercel.ts` e **versionado no Git** (a Vercel escaneia `api/` no clone; sem o arquivo, o rewrite caía no SPA e o cadastro dava "Unexpected end of JSON input")
- Pre-commit hook roda `npm run build:api` + `npm test`; `.gitattributes` marca `app/api/index.js` como binário
- Produção: `https://studioflow-navy.vercel.app` (sufixo `-navy` porque `studioflow.vercel.app` pertence a outra conta)
- Env vars configuradas no novo projeto Vercel `studioflow` (Root Directory = `app`), incl. `CORS_ORIGIN` ajustado por David

### Correção do fluxo de auth local
- **Bug:** login/logout local retornavam 500 `c.header is not a function` — o código passava o ctx tRPC para o `setCookie` do Hono, que exige um Hono Context
- **Correção:** cookie serializado com `cookie.serialize` e escrito em `ctx.resHeaders` (mesmo padrão do `auth-router.ts` OAuth)
- Validado de ponta a ponta via API: register → login → me → logout → me (null)
- Regra nova no AGENTS.md (Backend #11) para não repetir

### Remoção do OAuth Kimi (app 100% independente)
- `server/auth-router.ts` e `server/queries/users.ts` deletados (código morto do template)
- Fallback OAuth removido do `useAuth.ts` — auth local é o único auth
- Plugin `kimi-plugin-inspect-react` removido do Vite e das dependências
- Env vars `APP_ID`, `OWNER_UNION_ID`, `VITE_APP_ID`, `KIMI_*` removidas do `env.ts` e `.env.example` (`APP_SECRET` fica — assina o JWT do auth local)
- Cookie de sessão renomeado `kimi_sid` → `studioflow_sid`
- `vitest.config.ts` corrigido para incluir `contracts/**` (teste de constants rodava fora do include)
- Elimina a pendência da redirect URL no painel Kimi

### Outros
- Favicon criado (`app/public/favicon.svg` + link no `index.html`)
- Regra global nova no MestreProjects.md (seção 9): **sempre testar local antes de produção**
- AGENTS.md sincronizado com a estrutura real (`server/` no lugar de `api/`)

---

## 📋 Backlog
- Testes unitários (meta 80% cobertura)
- Sentry (error tracking)
- Relatórios PDF/CSV
- Agenda online pública
- Campanhas automáticas de reativação
- App mobile / PWA
