# BeautyFlow

SaaS multi-tenant para gestão de salões de beleza e centros estéticos.

## Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend:** Hono + tRPC + Drizzle ORM
- **Database:** PostgreSQL (Supabase)
- **Auth:** OAuth 2.0 Kimi + JWT
- **Deploy:** Vercel

## Módulos

- Dashboard com KPIs, sparklines, alertas e timeline
- CRM de Clientes com segmentação
- Agendamentos multi-profissional
- Catálogo de Serviços
- Gestão de Profissionais
- Financeiro e Comissões
- Comunicação Omnichannel
- Termos de Consentimento LGPD

## Como começar

```bash
cd app
npm install
cp .env.example .env
# Edite .env com suas credenciais
npm run db:push
npm run dev
```

Acesse `http://localhost:3000`

## Comandos úteis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run check` | Type-check |
| `npm run lint` | ESLint |
| `npm run quality` | Lint + type-check + test + format-check |
| `npm run db:push` | Push schema para o banco |
| `npm run build` | Build de produção |

## Estrutura

```
app/
├── api/           # Backend tRPC + Hono
├── db/            # Schema e migrações Drizzle
├── src/           # Frontend React
│   ├── pages/     # Páginas
│   ├── components/# Componentes
│   └── hooks/     # Hooks customizados
└── contracts/     # Tipos compartilhados
```

## Documentação

- `MEMORY.md` — Contexto rápido para novas sessões (leia primeiro)
- `AGENTS.md` — Regras de trabalho e contexto técnico
- `ROADMAP.md` — Changelog e fases do projeto
- `docs/adr/` — Decisões arquiteturais
- `docs/runbooks/` — Procedimentos operacionais
- `docs/DOR.md` / `docs/DOD.md` — Definition of Ready / Done
- `docs/LGPD.md` — Compliance LGPD

## Licença

Proprietário — BeautyFlow
