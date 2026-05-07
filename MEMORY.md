# BeautyFlow — Session Context

> **LEIA ESTE ARQUIVO PRIMEIRO** em toda sessão. Contém 100% do contexto necessário.

---

## 🚀 Início Rápido

```
1. Ler este arquivo (MEMORY.md) ← VOCÊ ESTÁ AQUI
2. Se precisar de regras de trabalho → AGENTS.md
3. Se precisar do roadmap detalhado → ROADMAP.md
4. Se precisar de decisões arquiteturais → docs/adr/
```

**Última atualização:** 07/05/2026

---

## 📊 Status do Projeto

| Check | Status |
|-------|--------|
| Type-check | ✅ Passando |
| Lint | ✅ Passando (0 erros) |
| Build | ✅ Passando |
| Testes | ⚠️ 0% (meta 80% configurada) |
| Deploy Vercel | ⚠️ Não configurado |
| Supabase DB | ⚠️ Projeto não criado |

---

## 🎯 Foco Atual

**Fase 5: Landing Page que Vende** — Concluída (07/05)

Fases 1-5 concluídas. Ver ROADMAP.md para detalhes completos.

---

## 🏗️ Stack

React 19 + Vite + Tailwind + shadcn/ui + tRPC + Drizzle ORM + Hono + PostgreSQL (Supabase) + OAuth 2.0 Kimi

---

## 📁 Estrutura de Pastas

```
app/
├── api/              # Backend tRPC + Hono
│   ├── router.ts     # Registro de routers
│   ├── middleware.ts # authedQuery, adminQuery
│   ├── boot.ts       # Entrypoint Hono (CORS, headers, /health)
│   ├── lib/audit.ts  # Helper de audit log
│   ├── queries/salon.ts  # Queries do negócio
│   ├── *-router.ts   # Routers por domínio
│   ├── kimi/         # OAuth SDK (NÃO MODIFICAR)
│   └── lib/          # Framework internals (NÃO MODIFICAR)
├── db/
│   ├── schema.ts     # 11 tabelas Drizzle (PostgreSQL)
│   └── relations.ts
├── src/
│   ├── pages/        # 10 páginas (Home, Dashboard, Clients...)
│   ├── components/   # AuthLayout, ui/
│   ├── providers/    # trpc.tsx, salon.tsx, useSalon.ts
│   └── hooks/        # useAuth, use-mobile
└── contracts/        # Tipos compartilhados

docs/
├── adr/              # 3 ADRs (stack, Supabase, Vercel)
├── runbooks/         # deploy, rollback, debug
├── DOR.md, DOD.md    # Ready/Done checklists
└── LGPD.md           # Compliance

.github/workflows/ci.yml  # Pipeline CI/CD
```

---

## ⚡ Comandos Essenciais

```powershell
cd app
npm run dev        # Dev server
npm run check      # Type-check
npm run lint       # ESLint
npm run quality    # Lint + type-check + test + format-check
npm run db:push    # Push schema para Supabase
npm run build      # Build produção
```

---

## 🛡️ Regras de Ouro

1. **Backend:** `authedQuery` para endpoints com login, filtrar por `salonId`, nunca raw SQL
2. **Frontend:** `useSalon()` para salão ativo, `{ enabled: !!salon }` em queries
3. **Arquivos proibidos:** `api/lib/`, `api/kimi/`, `src/components/ui/`
4. **Limite:** 400 linhas/arquivo (exceto shadcn/ui)
5. **Leitura única:** ler 1x, escrever 1x. Só reler se houver erro

---

## 👤 Perfil do Usuário

David Lucas — analista de sistemas, não desenvolvedor. Usa Kimi Code como ferramenta principal. Quer resultado direto, sem narração. Sempre em português.

---

## 🎯 Onde Paramos (Última Sessão)

**Data:** 07/05/2026
**Entregue:** Fase 5 — Landing Page que Vende completa
- DashboardMockup, TestimonialsSection, HowItWorksSection, SocialProofSection, CTASection
- SEO: meta tags, Open Graph, Twitter Cards, canonical
- Type-check ✅ | Build ✅ | ROADMAP atualizado

**Próximo passo:** Fase 6 — Integrações (WhatsApp, PDF, push, webhooks)

---

## 🔴 Ações Manuais Pendentes (VERIFICAR SEMPRE)

> **Regra:** Toda vez que uma fase exigir ação manual sua, eu aviso aqui. Você deve executar antes de prosseguir.

| # | Ação | Quando executar | Status | Quem faz |
|---|------|-----------------|--------|----------|
| 1 | Criar projeto no Supabase | **AGORA — ver passo a passo abaixo** | ⏳ PENDENTE | Você |
| 2 | Configurar `DATABASE_URL` no `.env` | Após criar Supabase | ⏳ PENDENTE | Você |
| 3 | Rodar `npm run db:push` no Supabase | Após configurar DATABASE_URL | ⏳ PENDENTE | Eu |
| 4 | Criar projeto no Vercel | Quando for deployar | ⏳ PENDENTE | Você |
| 5 | Configurar variáveis de ambiente no Vercel | Após criar projeto | ⏳ PENDENTE | Você |
| 6 | Configurar OAuth Kimi (callback URL) | Após ter URL do Vercel | ⏳ PENDENTE | Você |
| 7 | Rodar testes (`npm run test`) e atingir 80% | Antes de cada release | ⏳ PENDENTE | Eu aviso |
| 8 | Criar repositório no GitHub (se ainda não tiver) | Antes do CI/CD funcionar | ⏳ PENDENTE | Você |

---

## 🛠️ PASSO A PASSO — Criar Supabase (Ação Manual #1)

> Execute agora. Sem isso o banco não funciona e o app não sobe.

1. Acesse [supabase.com](https://supabase.com) e faça login (ou crie conta)
2. Clique **"New Project"**
3. Preencha:
   - **Organization:** sua organização (ou pessoal)
   - **Project name:** `beautyflow`
   - **Database password:** crie uma senha forte (salve em local seguro)
   - **Region:** `sa-east-1` (São Paulo — menor latência para Brasil)
4. Clique **"Create new project"** (demora ~2 min)
5. Após criar, vá em **Project Settings → Database**
6. Copie a **Connection string** no formato:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
7. Cole essa string aqui na conversa para eu atualizar o `.env`

**Quando terminar, me avise que eu configuro o resto.**

**Como usar esta tabela:**
- Eu atualizo o Status para ✅ quando a ação for concluída
- Eu adiciono novas linhas quando novas ações manuais aparecerem
- Você executa as ações marcadas como "Você" quando eu avisar no final da resposta

---

## 📚 Documentação Completa

| Arquivo | Quando usar |
|---------|-------------|
| `AGENTS.md` | Regras de trabalho, estrutura detalhada, comandos completos |
| `ROADMAP.md` | Registro de alterações, requisitos RF-NNN, fases do projeto |
| `docs/skills-active.md` | **Skills ativas, checklists pré-deploy, métricas de gatilho** |
| `docs/adr/` | Decisões arquiteturais |
| `docs/runbooks/` | Procedimentos operacionais |
| `docs/DOR.md` | Checklist: tarefa pronta para desenvolver? |
| `docs/DOD.md` | Checklist: tarefa realmente concluída? |
| `docs/LGPD.md` | Compliance |

## 🛠️ Skills Ativas

Todas as 4 skills foram ativadas. Detalhes completos em `docs/skills-active.md`.

| Skill | Aplicada em | Próxima ação |
|-------|-------------|--------------|
| **Security** | Headers, CORS, audit logs | Revisão OWASP pré-deploy |
| **Scalability** | PostgreSQL, multi-tenancy | PgBouncer quando >100 users |
| **Cost Reducer** | Componentes reutilizáveis | Auditar custos antes de escalar |
| **Self-Healing** | Aguardando padrão recorrente | Criar skill automática no 2º caso |

---

> **Próxima sessão:** "Oi Kimi, vamos continuar o BeautyFlow."
