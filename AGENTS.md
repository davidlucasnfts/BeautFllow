# COMO TRABALHAR COM O KIMI NESTE PROJETO

> **Antes de criar/modificar qualquer arquivo de documentação, consultar `docs/documentacao-estrutura.md`**

## Perfil do desenvolvedor
David Lucas é analista de sistemas (não desenvolvedor) que usa o Kimi Code como ferramenta principal de desenvolvimento. Tem visão de produto e negócio, mas não escreve código manualmente. Quer projetos escaláveis e profissionais. Prefere entender o "porquê" além do "como".

## Idioma e estilo de resposta
- **Sempre em português** — perguntas, respostas, confirmações, tudo
- **Modo direto:** resultado primeiro, sem rodeios, sem narração do processo
- Expandir explicações só se pedido explicitamente

## Regras de código
- **Limite de 400 linhas por arquivo.** Se ultrapassar, redistribuir em componentes/utilitários menores.
- **Exceção:** componentes do shadcn/ui em `src/components/ui/` — são de biblioteca externa, não mexer.

---

## 🚀 Regras Globais (aplicáveis a todos os projetos)

### Deploy
- **Deploy padrão: Vercel** — todos os projetos devem ser adaptados para Vercel (serverless)
- Criar `api/index.ts` como entrypoint, `vercel.json` com rewrites SPA

### Independência de IA
- **Nunca deixar dependência** de plataforma/oauth do gerador de código (Kimi OAuth, etc.)
- Remover código morto do template antes de deployar

### Banco de dados
- **Schema:** usar migrations em `supabase/migrations/NNN-descricao.sql`. Nunca editar `schema_safe.sql` manualmente — ele é gerado juntando as migrations.
- Comentar **data + descrição** no topo de cada migration

### Economia de Tokens
- **Leitura única** — ler arquivo 1x, fazer todas as mudanças na memória, escrever 1x
- **StrReplaceFile preferido** — só substituir o trecho que muda, não reescrever arquivo inteiro
- **Commits agrupados** — uma única chamada de commit com todas as mudanças
- **Push somente no final da sessão** — quando o usuário pedir para encerrar. Durante a sessão, commit local apenas
- **Sem prints desnecessários** — resultado direto, sem mostrar código que já foi visto

### Sincronização de Arquivos de Projeto
- **Sempre atualizar MEMORY.md e ROADMAP.md** quando uma funcionalidade for adicionada, removida ou concluída
- **Sempre atualizar arquivos mencionados** quando o usuário pedir remoção, alteração ou renomeação de qualquer item
- Nunca deixar arquivo de documentação desatualizado após mudanças no projeto
- **Nunca duplicar informação** entre arquivos de documentação — cada arquivo tem função única (ver `docs/documentacao-estrutura.md`)

### 📝 Onde salvar cada tipo de mudança (REGRA OBRIGATÓRIA)

| Tipo de mudança | Onde salvar | Nunca salvar em |
|-----------------|-------------|-----------------|
| Funcionalidade entregue | `MEMORY.md` (tabela + resumo) | `SESSION-CONTEXT.md` |
| Estado atual da sessão | `SESSION-CONTEXT.md` | `MEMORY.md` |
| Regra de codificação nova | `AGENTS.md` | Arquivo qualquer |
| Decisão arquitetural | `docs/adr/ADR-NNN-nome.md` | `AGENTS.md` sozinho |
| Padrão para todos os projetos | `MestreProjects.md` | Dentro de projeto |
| Mudança em segurança | `AGENTS.md` + `MestreBeaut.md` | Arquivo isolado |
| Estrutura de documentação | `docs/documentacao-estrutura.md` | Outro lugar |
| Guia completo do projeto | `MestreBeaut.md` | Outro lugar |

**Checklist antes de finalizar qualquer tarefa:**
```
□ A informação está no arquivo correto (ver tabela acima)?
□ Não existe outro arquivo com a mesma função?
□ Se modifiquei um arquivo, atualizei todos que referenciam ele?
□ Se criei arquivo novo, adicionei no docs/documentacao-estrutura.md?
□ Se deletei arquivo, removi referências em todos os docs?
```

### Datas em Funcionalidades
- **Sempre incluir a data de entrega** ao lado do nome da funcionalidade em MEMORY.md e ROADMAP.md
- Formato: `Funcionalidade — DD/MM` (ex: `Relatórios PDF/CSV — 06/05`)
- Funcionalidades antigas sem data definida podem ficar sem data
- Atualizar datas ao concluir novas melhorias

### Ações Manuais — REGRA CRÍTICA
- **Sempre que uma funcionalidade exigir ação manual** (rodar SQL no Supabase, configurar secret no GitHub/Vercel, criar bucket, env var, etc.), **adicionar em "Decisões pendentes" do `SESSION-CONTEXT.md`**
- **Sempre avisar David no final da resposta** com destaque em negrito e emoji ⚠️
- Nunca assumir que ele "já sabe" — ele não escreve código e não acompanha infraestrutura
- Itens pendentes devem ser claros: **o quê**, **onde fazer**, **como fazer**

---

## 🧠 Self-Healing — Aprender com Erros

> **Regra obrigatória:** SEMPRE consultar esta seção antes de criar/modificar/deletar qualquer arquivo.

### Erros Registrados (nunca repetir)

| # | Erro | Data | Prevenção |
|---|------|------|-----------|
| 001 | Criar arquivo sem verificar se função já existe | 11/05/2026 | Consultar `docs/documentacao-estrutura.md` antes |
| 002 | Sobrescrever arquivo fora do repo Git | 11/05/2026 | Nunca usar `overwrite` fora do working dir |
| 003 | Duplicar informação de segurança | 10/05/2026 | Expandir arquivo existente, nunca criar duplicata |
| 004 | Salvar no `MestreProjects.md` em vez de `AGENTS.md` | 11/05/2026 | Só salvar no global quando David disser "para todos os projetos" |
| 005 | Criar schema_safe.sql manual em vez de migrations | 12/05/2026 | Usar `supabase/migrations/NNN-descricao.sql`, gerar schema_safe.sql juntando |

### Checklist Obrigatório (executar antes de QUALQUER ação)

```
□ 1. Já existe arquivo com essa função? (ver docs/documentacao-estrutura.md)
□ 2. Estou no diretório correto? (nunca modificar fora do working dir sem confirmar)
□ 3. Vou usar StrReplaceFile ou WriteFile? (preferir StrReplaceFile sempre)
□ 4. Se criar arquivo novo, adicionei no docs/documentacao-estrutura.md?
□ 5. Se modificar arquivo, atualizei todos que referenciam ele?
□ 6. Onde devo salvar? AGENTS.md (projeto) ou MestreProjects.md (global)?
□ 7. Execute npm run check após mudanças?
```

### Regras de Ouro (nunca quebrar)

1. **NUNCA** criar arquivo de documentação sem verificar se função já existe
2. **NUNCA** usar `WriteFile overwrite` em arquivos fora do working directory
3. **NUNCA** duplicar informação entre arquivos
4. **NUNCA** salvar no `MestreProjects.md` sem explicitamente ser "para todos os projetos"
5. **SEMPRE** executar checklist antes de criar/modificar/deletar
6. **SEMPRE** preferir `StrReplaceFile` sobre `WriteFile`
7. **SEMPRE** consultar `docs/documentacao-estrutura.md` antes de nova documentação

---

## 🛠️ Skills Disponíveis (quando usar)

> **Skills do Kimi:** `C:\Users\David Lucas\.claude\skills\`

| Skill | Quando usar |
|-------|-------------|
| **security** | Revisão de segurança, auditoria, vulnerabilidades |
| **frontend-design** | Design de UI, componentes, landing pages |
| **scalability** | Problemas de performance, otimização |
| **cost-reducer** | Reduzir custos de infraestrutura |
| **researcher** | Pesquisa de mercado, concorrência, tecnologias |
| **self-healing** | Debugging, resolver bugs complexos |
| **customer-support** | Atendimento, FAQ, documentação de suporte |

---

## 🔒 Segurança — Regras Obrigatórias

> **Referência técnica:** `docs/adr/ADR-005-seguranca-padrao.md`
> **Referência global:** `MestreProjects.md` (seção 2)

### 🚫 PROIBIDO — Regras de Ouro
1. **NUNCA** hardcodear credenciais, senhas, chaves API, connection strings
2. **NUNCA** usar fallback `|| 'valor-padrao'` em variáveis de ambiente sensíveis
3. **NUNCA** expor `service_role_key` ou qualquer secret no frontend
4. **NUNCA** assumir role do usuário — sempre buscar do banco
5. **NUNCA** commitar `.env` com valores reais
6. **NUNCA** desabilitar RLS em tabelas de produção

### ✅ Obrigatório em todo projeto
- Headers de segurança: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- Rate limiting por IP + por usuário autenticado
- Validação de TODOS os inputs com Zod
- RBAC funcional: buscar role real do banco no contexto da API
- RLS habilitado em todas as tabelas com dados pessoais
- Audit logs para operações sensíveis (create, update, delete, login, export)
- `npm audit` no CI/CD — falhar em vulnerabilidades HIGH/CRITICAL
- TypeScript strict (`noImplicitAny`, `strictNullChecks`)
- Conexão com banco recria quando DATABASE_URL muda

### Checklist pré-deploy
```
□ Nenhuma credencial hardcoded
□ Nenhum fallback de secret
□ RLS em todas as tabelas com PII
□ RBAC busca role do banco
□ Rate limiting ativo
□ Headers de segurança configurados
□ npm audit limpo
□ Audit logs funcionando
□ .env não está no git
```

---

## 🎨 Regras de Design UX/UI

### Design System Base
- **shadcn/ui** como biblioteca principal de componentes
- **Tailwind CSS** para estilização
- **Radix UI** como base de acessibilidade
- **Lucide React** para ícones

### Botões de Ação — REGRAS OBRIGATÓRIAS

#### PROIBIDO: Dropdown de 3 pontinhos (MoreHorizontal)
- **NUNCA** usar `<DropdownMenu>` com `<MoreHorizontal>` para esconder ações
- Todas as ações devem ser botões de ícone visíveis diretamente

#### Visibilidade
- **Sempre visíveis** — nunca usar `opacity-0` + `group-hover:opacity-100`

#### Cores por Ação (sempre com fundo)
| Ação | Cor de Fundo | Cor do Ícone | Hover |
|---|---|---|---|
| Editar | `bg-blue-50` | `text-blue-600` | `hover:bg-blue-100` |
| Excluir/Recusar | `bg-red-50` | `text-red-600` | `hover:bg-red-100` |
| Aprovar/Confirmar | `bg-green-50` | `text-green-600` | `hover:bg-green-100` |
| Ver/Preview | `bg-slate-50` | `text-slate-600` | `hover:bg-slate-100` |
| Link/Afiliar | `bg-purple-50` | `text-purple-600` | `hover:bg-purple-100` |

#### Layout — Botões com Texto (padrão preferido)
- **Sempre com texto + ícone**, nunca ícone sozinho
- Empilhados verticalmente (`flex-col gap-1`) na coluna de ações
- Tamanho compacto: `text-[10px] font-medium`, padding `px-1.5 py-0.5`

### Tabelas — Posicionamento Unificado
- **Coluna de Ações na primeira posição** (antes do nome)
- **TODAS as ações na mesma coluna**
- Status com badges: `ativo`=verde, `pendente`=âmbar, `inativo`=cinza
- **Hover azul**: `hover:bg-blue-50/50` em todas as linhas
- **Clique na linha** → abre preview/detalhes
- Botões usam `stopPropagation`

### Modal/Dialog
- Cancelar: `variant="outline"`
- Confirmar/Salvar: `bg-blue-600 hover:bg-blue-700`
- Excluir: `bg-red-600 hover:bg-red-700`
- Aprovar: `bg-green-600 hover:bg-green-700`

### Cores do Projeto (Tailwind)
| Uso | Cor |
|---|---|
| Primária (ações principais) | `blue-600` |
| Sucesso | `green-600` |
| Perigo/Excluir | `red-600` |
| Aviso/Pendente | `amber-600` |
| Texto principal | `slate-800` |
| Texto secundário | `slate-500` |
| Fundo página | `slate-50` |
| Fundo card | `white` |

---

## 📁 Estrutura de Diretórios

```
app/
├── api/                    # Backend tRPC + Hono
│   ├── router.ts           # Registro de routers
│   ├── middleware.ts       # publicQuery, authedQuery, adminQuery
│   ├── context.ts          # Contexto com user autenticado
│   ├── boot.ts             # Entrypoint Hono (CORS, headers, /health)
│   ├── lib/audit.ts        # Helper de audit log
│   ├── lib/env.ts          # Variáveis de ambiente
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
│   ├── schema.ts           # Tabelas Drizzle (fonte da verdade)
│   ├── relations.ts
│   └── seed.ts
├── contracts/              # Tipos e constantes compartilhados
├── src/
│   ├── main.tsx            # Entry point
│   ├── App.tsx             # Rotas
│   ├── providers/          # Contextos (trpc, salon, auth)
│   ├── hooks/              # Hooks customizados
│   ├── components/         # Componentes reutilizáveis
│   │   ├── appointments/   # Componentes de agendamentos
│   │   ├── calendar/       # Componentes de calendário
│   │   └── ui/             # shadcn/ui (NÃO MODIFICAR)
│   ├── pages/              # Páginas da aplicação
│   └── const.ts
├── .env                    # Variáveis (NÃO MODIFICAR, NÃO COMMITAR)
├── .env.example            # Template de variáveis
├── vite.config.ts
├── drizzle.config.ts
└── package.json

docs/
├── adr/                    # Architecture Decision Records
├── requirements/           # Requisitos funcionais (PRD, RF-NNN)
├── runbooks/               # Procedimentos operacionais
├── documentacao-estrutura.md
├── DOR.md
├── DOD.md
└── LGPD.md

supabase/
├── migrations/             # Migrations incrementais
│   ├── 001-schema-inicial.sql
│   ├── 002-rls-policies.sql
│   └── ...
└── schema_safe.sql         # Consolidado idempotente (gerado automaticamente)

.github/workflows/
└── ci.yml                  # Pipeline CI/CD
```

---

## 🔧 Comandos

```powershell
cd app
npm run dev        # Desenvolvimento
npm run check      # Type-check
npm run lint       # ESLint
npm run lint:fix   # ESLint com auto-fix
npm run format     # Prettier write
npm run format:check # Prettier check
npm run test       # Testes (vitest)
npm run quality    # Lint + type-check + test + format-check
npm run build      # Build
npm run db:push    # Push schema (dev)
npm run db:migrate # Aplicar migrations (prod)
```

---

## 📋 Regras Técnicas

**Backend:**
1. Sempre usar `authedQuery` para endpoints com login
2. Sempre filtrar por `salonId` — nunca retornar dados de múltiplos tenants
3. Nunca modificar `api/lib/` ou `api/kimi/`
4. Novas tabelas em `db/schema.ts`, gerar migration em `supabase/migrations/`
5. Novos routers em `api/*-router.ts`, registrar em `api/router.ts`
6. Usar `api/queries/salon.ts` para queries reutilizáveis
7. Operações críticas (create/update/delete) devem gerar audit log via `api/lib/audit.ts`
8. Rate limiting ativo: 100 req/min por IP, 5 req/min em auth endpoints
9. Sempre validar inputs com Zod antes de processar
10. Migrations manuais em `supabase/migrations/NNN-descricao.sql`. `schema_safe.sql` é gerado juntando todas

**Frontend:**
1. Sempre usar `useSalon()` para obter o salão ativo
2. Desabilitar queries quando `!salon` usando `{ enabled: !!salon }`
3. Invalidar queries após mutations: `utils.customer.list.invalidate()`
4. Usar componentes shadcn/ui de `@/components/ui/*`
5. Novas páginas em `src/pages/`, registrar em `src/App.tsx`

**Database (Drizzle ORM):**
1. Nunca usar raw SQL — sempre Drizzle query API
2. FK columns: `bigint("col", { mode: "number" })`
3. Tipos: usar `typeof table.$inferSelect`
4. Dates: colunas `date` e `timestamp` retornam `Date` objects

---

## 📚 Padrões Adotados

- **Conventional Commits:** `tipo(escopo):[COD] - descrição`
- **Branches:** `feature-COD-descricao`, `hotfix-COD-descricao`
- **DoR/DoD:** Documentados em `docs/DOR.md` e `docs/DOD.md`
- **ADRs:** Decisões arquiteturais em `docs/adr/`
- **Runbooks:** Procedimentos operacionais em `docs/runbooks/`
- **LGPD:** Compliance em `docs/LGPD.md`
- **CI/CD:** Pipeline em `.github/workflows/ci.yml`
- **Cobertura de testes:** Meta 80% (configurado no vitest.config.ts)

---

## ⚠️ Exceções ao Documento Mestre

| Regra do Mestre | Decisão no BeautyFlow | Justificativa |
|-----------------|----------------------|---------------|
| Código em português | Código em inglês, comentários/docs em português | Padrão de mercado (React, tRPC, Drizzle são em inglês). Time é 1 pessoa + IA |
| Clean Architecture completa | Estrutura plana (api/, db/, src/) | MVP funcional. Clean Architecture quando o time crescer |
| Testes 80% cobertura | Meta 80%, atualmente 0% | MVP em construção. Testes após estabilização |
| Kubernetes | Vercel serverless | Custo zero, deploy rápido |
| Rate limiting 100 req/15min | 100 req/1min | Hono rate-limiter usa windowMs em ms; ajustado para MVP |
