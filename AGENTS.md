# BeautyFlow — Regras de Trabalho

> Arquivo de referência. **Ponto de entrada:** MEMORY.md

---

## Perfil do Usuário

David Lucas — analista de sistemas, não desenvolvedor. Usa Kimi Code como ferramenta principal. Quer resultado direto, sem narração. Sempre em português.

## Comunicação

- Sempre em português
- Modo direto: resultado primeiro, sem narração do processo
- Expandir explicações só se pedido explicitamente

## Regras de Código

- Limite de 400 linhas por arquivo. Se ultrapassar, redistribuir em componentes/utilitários menores
- Exceção: componentes do shadcn/ui em `src/components/ui/` — são de biblioteca externa, não mexer
- Leitura única (ler 1x, escrever 1x). Só reler se houver erro ou se o usuário pedir
- StrReplaceFile preferido, commits agrupados, sem prints desnecessários

## Regras Globais

- **Deploy:** Vercel (serverless). Criar `api/index.ts` como entrypoint, `vercel.json` com rewrites SPA
- **Independência de IA:** Nunca deixar dependência de plataforma/oauth do gerador de código. Remover código morto do template antes de deployar
- **Banco de dados:** Sempre usar `schema_safe.sql` (nunca `schema.sql`). Comentar data + descrição no topo de cada alteração no schema
- **Documentação:** Sempre atualizar ROADMAP.md ao adicionar/remover/concluir funcionalidades
- **Datas:** Sempre incluir data de entrega no formato `Funcionalidade — DD/MM` no ROADMAP.md

## Sobre o Projeto

BeautyFlow é um SaaS multi-tenant de gestão para salões de beleza e centros estéticos.

- **Stack:** React 19 + TypeScript + Vite + Tailwind + shadcn/ui + tRPC + Drizzle ORM + Hono + PostgreSQL (Supabase)
- **Módulos:** Dashboard, CRM Clientes, Agendamentos, Serviços, Profissionais, Financeiro, Comunicação Omnichannel, Termos/LGPD, Landing Page, Auth OAuth 2.0

## Estado Atual (MVP Funcional)

### Backend
- Auth: OAuth 2.0 Kimi + JWT sessions + RBAC (user/admin)
- Multi-tenancy: Row-level via `salonId` em todas as tabelas
- Schema: 11 tabelas (users, salons, salon_users, clients, services, professionals, appointments, consent_forms, consent_signatures, communications, financial_records, audit_logs)
- Routers: auth, salon, customer, service, professional, appointment, financial, communication, consent, dashboard
- Queries: Todas em `api/queries/salon.ts` com isolamento por tenant
- Segurança: secureHeaders, CORS restrito, audit logs em operações críticas

### Frontend
- Layout: Sidebar responsiva com redimensionamento, seleção de salão, avatar
- Páginas: Landing (/), Dashboard (/dashboard), Clientes (/clients), Agendamentos (/appointments), Serviços (/services), Profissionais (/professionals), Financeiro (/financial), Comunicação (/communications), Termos/LGPD (/consent)
- Estado: useAuth (OAuth), useSalon (context com localStorage)
- tRPC client: `src/providers/trpc.tsx`

## Estrutura de Diretórios

```
app/
├── api/                    # Backend tRPC + Hono
│   ├── router.ts           # Registro de routers
│   ├── middleware.ts       # publicQuery, authedQuery, adminQuery
│   ├── context.ts          # Contexto com user autenticado
│   ├── boot.ts             # Entrypoint Hono (CORS, headers, /health)
│   ├── lib/audit.ts        # Helper de audit log
│   ├── auth-router.ts      # Auth (me, logout)
│   ├── salon-router.ts     # CRUD salões
│   ├── client-router.ts    # CRUD clientes
│   ├── service-router.ts   # CRUD serviços
│   ├── professional-router.ts
│   ├── appointment-router.ts
│   ├── financial-router.ts
│   ├── communication-router.ts
│   ├── consent-router.ts
│   ├── dashboard-router.ts
│   ├── queries/
│   │   ├── connection.ts   # Drizzle DB connection
│   │   ├── users.ts
│   │   └── salon.ts        # Queries do negócio
│   ├── kimi/               # OAuth SDK (NÃO MODIFICAR)
│   └── lib/                # Framework internals (NÃO MODIFICAR)
├── db/
│   ├── schema.ts           # Tabelas Drizzle
│   ├── relations.ts
│   └── seed.ts
├── contracts/              # Tipos compartilhados
├── src/
│   ├── main.tsx            # Entry point
│   ├── App.tsx             # Rotas
│   ├── providers/
│   │   ├── trpc.tsx        # tRPC client
│   │   ├── salon.tsx       # Contexto de salão
│   │   └── useSalon.ts     # Hook useSalon
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── use-mobile.ts
│   ├── components/
│   │   ├── AuthLayout.tsx
│   │   ├── AuthLayoutSkeleton.tsx
│   │   └── ui/             # shadcn/ui (NÃO MODIFICAR)
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Clients.tsx
│   │   ├── Appointments.tsx
│   │   ├── Services.tsx
│   │   ├── Professionals.tsx
│   │   ├── Financial.tsx
│   │   ├── Communications.tsx
│   │   └── Consent.tsx
│   └── const.ts
├── .env                    # Variáveis (NÃO MODIFICAR)
├── vite.config.ts
├── drizzle.config.ts
└── package.json

docs/
├── adr/                    # Architecture Decision Records
│   ├── ADR-001-stack-react-trpc-drizzle.md
│   ├── ADR-002-supabase-postgresql.md
│   └── ADR-003-vercel-deploy.md
├── runbooks/               # Procedimentos operacionais
│   ├── deploy.md
│   ├── rollback.md
│   └── debug-producao.md
├── requirements/           # Requisitos detalhados (RF-NNN)
├── DOR.md                  # Definition of Ready
├── DOD.md                  # Definition of Done
└── LGPD.md                 # Compliance LGPD

.github/workflows/
└── ci.yml                  # Pipeline CI/CD
```

## Comandos

```powershell
cd app
npm run dev        # Desenvolvimento
npm run check      # Type-check
npm run db:push    # Push schema
npm run build      # Build
npm start          # Produção
npm run lint       # ESLint
npm run lint:fix   # ESLint com auto-fix
npm run format     # Prettier write
npm run format:check # Prettier check
npm run test       # Testes (vitest)
npm run quality    # Lint + type-check + test + format-check
```

## Regras Técnicas

**Backend:**
1. Sempre usar `authedQuery` para endpoints com login
2. Sempre filtrar por `salonId` — nunca retornar dados de múltiplos tenants
3. Nunca modificar `api/lib/` ou `api/kimi/`
4. Novas tabelas em `db/schema.ts`, rodar `npm run db:push`
5. Novos routers em `api/*-router.ts`, registrar em `api/router.ts`
6. Usar `api/queries/salon.ts` para queries reutilizáveis
7. Operações críticas (create/update/delete) devem gerar audit log via `api/lib/audit.ts`

**Frontend:**
1. Sempre usar `useSalon()` para obter o salão ativo
2. Desabilitar queries quando `!salon` usando `{ enabled: !!salon }`
3. Invalidar queries após mutations: `utils.customer.list.invalidate()`
4. Usar componentes shadcn/ui de `@/components/ui/*`
5. Novas páginas em `src/pages/`, registrar em `src/App.tsx`

**Database (Drizzle ORM):**
1. Nunca usar raw SQL — sempre Drizzle query API
2. FK columns: `bigint("col", { mode: "number", unsigned: true })`
3. Tipos: usar `typeof table.$inferSelect`
4. Dates: colunas `date` e `timestamp` retornam `Date` objects

## Padrões Adotados do Documento Mestre

- **Conventional Commits:** `tipo(escopo):[COD] - descrição`
- **Branches:** `feature-COD-descrição`, `hotfix-COD-descrição`
- **DoR/DoD:** Documentados em `docs/DOR.md` e `docs/DOD.md`
- **ADRs:** Decisões arquiteturais em `docs/adr/`
- **Runbooks:** Procedimentos operacionais em `docs/runbooks/`
- **LGPD:** Compliance em `docs/LGPD.md`
- **CI/CD:** Pipeline em `.github/workflows/ci.yml`
- **Cobertura de testes:** Meta 80% (configurado no vitest.config.ts)

## Exceções ao Documento Mestre

| Regra do Mestre | Decisão no BeautyFlow | Justificativa |
|-----------------|----------------------|---------------|
| Código em português | Código em inglês, comentários/docs em português | Padrão de mercado (React, tRPC, Drizzle são em inglês). Time é 1 pessoa + IA, não há barreira de idioma no código |
| Clean Architecture completa | Estrutura plana (api/, db/, src/) | MVP funcional. Clean Architecture será adotada quando o time crescer ou quando modularizarmos em microsserviços |
| Testes 80% cobertura | Meta 80%, atualmente 0% | MVP em construção. Testes serão implementados após estabilização das APIs |
| Kubernetes | Vercel serverless | Custo zero, deploy rápido. K8s será considerado quando escalar para multi-região |
