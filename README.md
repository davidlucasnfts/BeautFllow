# BeautyFlow

SaaS multi-tenant para gestao de saloes de beleza e centros esteticos.

## Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend:** Hono + tRPC + Drizzle ORM
- **Database:** PostgreSQL (Supabase)
- **Auth:** OAuth 2.0 Kimi + JWT
- **Deploy:** Vercel

## Modulos

- Dashboard com KPIs, sparklines, alertas e timeline
- CRM de Clientes com segmentacao
- Agendamentos multi-profissional
- Catalogo de Servicos
- Gestao de Profissionais
- Financeiro e Comissoes
- Comunicacao Omnichannel
- Termos de Consentimento LGPD

## Como comecar

### 1. Clone o repositorio

```bash
git clone https://github.com/SEU_USUARIO/beautyflow.git
cd beautyflow/app
```

### 2. Instale as dependencias

```bash
npm install
```

### 3. Configure as variaveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
DATABASE_URL=postgresql://postgres:SUA_SENHA@db.XXXX.supabase.co:5432/postgres
VITE_KIMI_AUTH_URL=https://kimi.com
VITE_APP_ID=seu_app_id
OWNER_UNION_ID=seu_union_id
JWT_SECRET=seu_jwt_secret
```

### 4. Rode as migracoes do banco

```bash
npx drizzle-kit push
```

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:3000`

## Comandos uteis

| Comando | Descricao |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run check` | Type-check |
| `npm run db:push` | Push schema para o banco |
| `npm run build` | Build de producao |
| `npm start` | Iniciar em producao |

## Estrutura

```
app/
├── api/           # Backend tRPC + Hono
├── db/            # Schema e migracoes Drizzle
├── src/           # Frontend React
│   ├── pages/     # Paginas
│   ├── components/# Componentes
│   └── hooks/     # Hooks customizados
└── contracts/     # Tipos compartilhados
```

## Documentacao

- `AGENTS.md` — Regras de trabalho e contexto tecnico
- `MEMORY.md` — Estado atual e decisoes de arquitetura
- `ROADMAP.md` — Changelog e fases do projeto

## Licenca

Proprietario — BeautyFlow
