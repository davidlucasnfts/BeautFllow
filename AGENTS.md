# BeautyFlow — Guia para Kimi Code

Ultima atualizacao: 05/05/2026

## Perfil do Usuario

David Lucas e analista de sistemas (nao desenvolvedor) que usa o Kimi Code como ferramenta principal de desenvolvimento. Tem visao de produto e negocio, mas nao escreve codigo manualmente. Quer projetos escalaveis e profissionais. Prefere entender o "porque" alem do "como".

## Comunicacao

- Sempre em portugues
- Modo direto: resultado primeiro, sem narracao do processo
- Expandir explicacoes so se pedido explicitamente

## Regras de Codigo

- Limite de 400 linhas por arquivo. Se ultrapassar, redistribuir em componentes/utilitarios menores
- Excecao: componentes do shadcn/ui em `src/components/ui/` — sao de biblioteca externa, nao mexer

## Regras Globais

- **Deploy:** Vercel (serverless). Criar `api/index.ts` como entrypoint, `vercel.json` com rewrites SPA
- **Independencia de IA:** Nunca deixar dependencia de plataforma/oauth do gerador de codigo. Remover codigo morto do template antes de deployar
- **Banco de dados:** Sempre usar `schema_safe.sql` (nunca `schema.sql`). Comentar data + descricao no topo de cada alteracao no schema
- **Economia de tokens:** Leitura unica (ler arquivo 1x, fazer todas as mudancas na memoria, escrever 1x). So reler se houver erro ou se o usuario pedir. StrReplaceFile preferido, commits agrupados, sem prints desnecessarios
- **Documentacao:** Sempre atualizar ROADMAP.md ao adicionar/remover/concluir funcionalidades. Nunca deixar doc desatualizado
- **Datas:** Sempre incluir data de entrega no formato `Funcionalidade — DD/MM` no ROADMAP.md

## Sobre o Projeto

BeautyFlow e um SaaS multi-tenant de gestao para saloes de beleza e centros esteticos.

- **Stack:** React 19 + TypeScript + Vite + Tailwind + shadcn/ui + tRPC + Drizzle ORM + Hono + MySQL
- **Modulos:** Dashboard, CRM Clientes, Agendamentos, Servicos, Profissionais, Financeiro, Comunicacao Omnichannel, Termos/LGPD, Landing Page, Auth OAuth 2.0

## Estado Atual (MVP Funcional)

### Backend
- Auth: OAuth 2.0 Kimi + JWT sessions + RBAC (user/admin)
- Multi-tenancy: Row-level via `salonId` em todas as tabelas
- Schema: 11 tabelas (users, salons, salon_users, clients, services, professionals, appointments, consent_forms, consent_signatures, communications, financial_records, audit_logs)
- Routers: auth, salon, customer, service, professional, appointment, financial, communication, consent, dashboard
- Queries: Todas em `api/queries/salon.ts` com isolamento por tenant

### Frontend
- Layout: Sidebar responsiva com redimensionamento, selecao de salao, avatar
- Paginas: Landing (/), Dashboard (/dashboard), Clientes (/clients), Agendamentos (/appointments), Servicos (/services), Profissionais (/professionals), Financeiro (/financial), Comunicacao (/communications), Termos/LGPD (/consent)
- Estado: useAuth (OAuth), useSalon (context com localStorage)
- tRPC client: `src/providers/trpc.tsx`

## Estrutura de Diretorios

```
app/
├── api/                    # Backend tRPC + Hono
│   ├── router.ts           # Registro de routers
│   ├── middleware.ts       # publicQuery, authedQuery, adminQuery
│   ├── context.ts          # Contexto com user autenticado
│   ├── auth-router.ts      # Auth (me, logout)
│   ├── salon-router.ts     # CRUD saloes
│   ├── client-router.ts    # CRUD clientes
│   ├── service-router.ts   # CRUD servicos
│   ├── professional-router.ts
│   ├── appointment-router.ts
│   ├── financial-router.ts
│   ├── communication-router.ts
│   ├── consent-router.ts
│   ├── dashboard-router.ts
│   ├── queries/
│   │   ├── connection.ts   # Drizzle DB connection
│   │   ├── users.ts
│   │   └── salon.ts        # Queries do negocio
│   ├── kimi/               # OAuth SDK (NAO MODIFICAR)
│   └── lib/                # Framework internals (NAO MODIFICAR)
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
│   │   └── salon.tsx       # Contexto de salao
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── use-mobile.ts
│   ├── components/
│   │   ├── AuthLayout.tsx
│   │   ├── AuthLayoutSkeleton.tsx
│   │   └── ui/             # shadcn/ui (NAO MODIFICAR)
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
├── .env                    # Variaveis (NAO MODIFICAR)
├── vite.config.ts
├── drizzle.config.ts
└── package.json
```

## Comandos

```powershell
cd app
npm run dev        # Desenvolvimento
npm run check      # Type-check
npm run db:push    # Push schema
npm run build      # Build
npm start          # Producao
```

## Regras Tecnicas

**Backend:**
1. Sempre usar `authedQuery` para endpoints com login
2. Sempre filtrar por `salonId` — nunca retornar dados de multiplos tenants
3. Nunca modificar `api/lib/` ou `api/kimi/`
4. Novas tabelas em `db/schema.ts`, rodar `npm run db:push`
5. Novos routers em `api/*-router.ts`, registrar em `api/router.ts`
6. Usar `api/queries/salon.ts` para queries reutilizaveis

**Frontend:**
1. Sempre usar `useSalon()` para obter o salao ativo
2. Desabilitar queries quando `!salon` usando `{ enabled: !!salon }`
3. Invalidar queries apos mutations: `utils.customer.list.invalidate()`
4. Usar componentes shadcn/ui de `@/components/ui/*`
5. Novas paginas em `src/pages/`, registrar em `src/App.tsx`

**Database (Drizzle ORM):**
1. Nunca usar raw SQL — sempre Drizzle query API
2. FK columns: `bigint("col", { mode: "number", unsigned: true })`
3. Tipos: usar `typeof table.$inferSelect`
4. Dates: colunas `date` e `timestamp` retornam `Date` objects
