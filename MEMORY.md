# BeautyFlow — Contexto Rapido

Ultima atualizacao: 06/05/2026

## O que e
SaaS multi-tenant para saloes de beleza. Stack: React 19 + Vite + Tailwind + shadcn/ui + tRPC + Drizzle ORM + Hono + PostgreSQL (Supabase). Auth: OAuth 2.0 Kimi + JWT.

## Quem usa
David Lucas — analista de sistemas, nao desenvolvedor. Usa Kimi Code como ferramenta principal. Quer resultado direto, sem narracao. Sempre em portugues.

## Foco do Projeto: SaaS Escalavel e Vendavel

### Principios
- **Multi-tenancy robusto:** isolamento completo de dados por salao (RLS no Supabase)
- **Seguranca:** LGPD nativo, criptografia, audit logs, backups automaticos
- **Escalabilidade:** serverless, pay-as-you-grow, sem infraestrutura para gerenciar
- **UX profissional:** identidade visual premium, micro-interacoes, mobile-first
- **Conversao:** landing page que vende, trial gratuito, upgrade facil

### Stack de Producao
| Camada | Tecnologia | Motivo |
|--------|-----------|--------|
| Frontend | React 19 + Vite + Tailwind + shadcn/ui | Performance, DX, consistencia visual |
| Backend | Hono + tRPC + Drizzle ORM | Type-safe, rapido, moderno |
| Database | Supabase PostgreSQL | Gratis ate 500MB, RLS, Realtime, Auth, Storage |
| Auth | OAuth 2.0 Kimi + JWT | Rapido de implementar, migravel para Supabase Auth |
| Deploy | Vercel | Serverless, preview deploys, CDN global, gratis |
| Pagamentos | Stripe (futuro) | Padrao de mercado para SaaS |
| Email | Resend (futuro) | Gratis ate 3000/dia, simples |
| WhatsApp | Evolution API ou 360dialog (futuro) | Omnichannel real |
| Imagens | Supabase Storage (futuro) | Integrado, barato |

### Regras de Qualidade
- Max 400 linhas/arquivo (exceto shadcn/ui)
- Leitura unica (ler 1x, escrever 1x). So reler se houver erro
- Sempre atualizar ROADMAP.md ao entregar funcionalidades
- Datas no formato `Funcionalidade — DD/MM`
- Sugerir tecnologias melhores quando identificar oportunidade
- Nunca duplicar informacao entre Registro de Alteracoes e Fases do Projeto

## Decisoes de Arquitetura

### Banco de Dados: Supabase (PostgreSQL)
- **Gratis ate 500MB / 2 milhoes de requisicoes/mes**
- PostgreSQL com extensao pgvector (futuro: busca semantica)
- Row Level Security (RLS) para multi-tenancy nativo
- Realtime subscriptions (notificacoes em tempo real)
- Storage para imagens (fotos de clientes, documentos)
- Auth nativo (migravel do Kimi OAuth no futuro)
- Backups automaticos

### Deploy: Vercel
- **Gratis para projetos pessoais / hobby**
- Serverless functions (API routes)
- Edge Network (CDN global)
- Preview deployments para cada PR
- Analytics integrado

## Estrutura
```
app/
├── api/           # tRPC + Hono (routers, middleware, queries)
│   ├── kimi/      # OAuth SDK (NAO MODIFICAR)
│   └── lib/       # Framework internals (NAO MODIFICAR)
├── db/            # Drizzle schema, relations, seed (PostgreSQL)
├── src/
│   ├── pages/     # Paginas (Home, Dashboard, Clients, etc)
│   ├── components/# AuthLayout, ui/
│   ├── hooks/     # useAuth, use-mobile
│   └── providers/ # trpc.tsx, salon.tsx
└── contracts/     # Tipos compartilhados
```

## Comandos
```powershell
cd app
npm run dev        # Dev
npm run check      # Type-check
npm run db:push    # Schema DB (Supabase)
npm run build      # Build
```

## Regras tecnicas
- Backend: `authedQuery`, filtrar por `salonId`, nunca mexer em `api/lib/` ou `api/kimi/`
- Frontend: usar `useSalon()`, desabilitar queries com `{ enabled: !!salon }`, invalidar apos mutations
- DB: nunca raw SQL, FK `bigint("col", { mode: "number" })`, tipos `typeof table.$inferSelect`

## Fases em andamento
| Fase | Status | Proxima tarefa |
|------|--------|----------------|
| 1. Identidade Visual | ✅ | Concluida — 05/05 |
| 2. Dashboard Rico | ✅ | Concluida — 05/05 |
| 3. Migracao Supabase | [~] | Em andamento — 06/05 |
| 4. Calendario Pro | [ ] | View diaria, drag-and-drop |
| 5. Landing Page | [ ] | Imagens IA, depoimentos |
| 6. Integracoes | [ ] | WhatsApp API, PDF, push |
| 7. Relatorios | [ ] | Faturamento, ocupacao, CSV |
| 8. Micro-interacoes | [ ] | Toasts, loaders, animacoes |
| 9. Seguranca | [ ] | LGPD, audit logs, rate limit |

## UX/UI (aplicar em toda implementacao)
- Hero compacto (sem `min-h-screen`), conteudo acima do fold
- Headline na dor, CTA repetido, prova social no hero
- Cores distintas por card, botoes sempre visiveis
- Mobile: touch 44px+, stack vertical, menu hamburguer

---

**Documentacao completa:** `AGENTS.md` (regras de trabalho) | `ROADMAP.md` (changelog e tarefas detalhadas)
