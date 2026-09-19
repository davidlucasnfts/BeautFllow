# COMO TRABALHAR COM O KIMI NESTE PROJETO

> **Antes de criar/modificar qualquer arquivo de documentação, consultar `docs/documentacao-estrutura.md`**

## Perfil do desenvolvedor
David Lucas é analista de sistemas (não desenvolvedor) que usa o Kimi Code como ferramenta principal de desenvolvimento. Tem visão de produto e negócio, mas não escreve código manualmente. Quer projetos escaláveis e profissionais. Prefere entender o "porquê" além do "como".

## Idioma e estilo de resposta
- **Sempre em português** — perguntas, respostas, confirmações, tudo
- **Modo direto:** resultado primeiro, sem rodeios, sem narração do processo
- Expandir explicações só se pedido explicitamente

### Visualização externa de propostas (regra obrigatória)
- Quando David pedir para **visualizar algo externamente** (botão, funcionalidade, layout, tela nova), gerar um **documento HTML navegável em `docs/mockups/`** com as opções renderizadas de verdade — nunca apenas descrever em texto/ASCII no chat
- O mockup deve conter: contexto, cada opção com prévia (mobile ~390px e desktop), prós/contras e recomendação
- David escolhe a opção no navegador; só então implementar em branch local para homologação

## Regras de código
- **Limite de 400 linhas por arquivo.** Se ultrapassar, redistribuir em componentes/utilitários menores.
- **REUSAR padrões existentes — nunca recriar do zero (19/09/2026).** Antes de criar qualquer componente, campo de formulário, seletor de data ou interação nova, verificar se o app já tem um padrão aprovado que faz aquilo (ex.: `DatePicker` para datas/meses, botões do design system, ficha expansível, lista estilo Fila do Dia). Reusar/estender o existente — isso garante consistência, economiza tempo e evita comportamentos fora do esperado. Ex.: campo de mês usa `DatePicker` com `label` (campo inteiro clicável), como em `AppointmentFilters.tsx` — **nunca** usar o input nativo `type="month"` (só abre clicando no ícone).
- **Exceção:** componentes do shadcn/ui em `src/components/ui/` — são de biblioteca externa, não mexer. Exceções já aplicadas:
  - `ui/skeleton.tsx` usa `bg-muted` (não `bg-accent` — accent é cor da marca do tema, deixaria todo loading colorido)
  - **Sintaxe Tailwind v3 (09/09/2026):** os componentes vieram gerados com sintaxe v4 (`w-(--var)`, `outline-hidden`, `size-8!`) que falha silenciosamente no v3.4 do projeto — todo o `ui/` foi convertido para a forma v3 (`w-[var(--var)]`, `outline-none`, `!size-8`). Não regenerar esses arquivos a partir do CLI novo do shadcn sem revisar a sintaxe
  - `ui/calendar.tsx` (19/09/2026): dia "hoje" usa contorno sutil (`border-primary/50`), não fundo preenchido — preenchido ao lado de um dia selecionado parecia "2 datas marcadas"

---

## 🚀 Regras Globais (aplicáveis a todos os projetos)

### Deploy
- **Deploy padrão: Vercel** — todos os projetos devem ser adaptados para Vercel (serverless)
- Criar `api/index.ts` como entrypoint, `vercel.json` com rewrites SPA
- **Sempre testar local antes de produção** — toda mudança validada com `npm run dev` antes de subir. Regra global: `MestreProjects.md` seção 9 (Fluxo Local antes de Produção)
- **Homologação local antes de qualquer deploy** — nada vai pra Vercel sem David validar visualmente rodando local (`localhost:3000`). Push/deploy só acontece quando ele pedir pra subir
- **Mudanças de aparência: prévia antes de fechar** — para alteração visual, David quer ver e decidir antes de qualquer coisa ser alterada de vez; implementar em branch local, ele homologa, aí sim mescla

### Independência de IA
- **Nunca deixar dependência** de plataforma/oauth do gerador de código (Kimi OAuth, etc.)
- Remover código morto do template antes de deployar

### Banco de dados
- **Schema:** usar migrations em `supabase/migrations/NNN-descricao.sql`. Nunca editar `schema_safe.sql` manualmente — ele é gerado juntando as migrations.
- Comentar **data + descrição** no topo de cada migration
- **SENHA do PostgreSQL: nunca usar caracteres especiais que quebram a URL** (`!`, `@`, `#`, `$`, `%`, `&`, etc.)
  - Se a senha já existir com caracteres especiais, codificar com `encodeURIComponent()` antes de montar a `DATABASE_URL`
  - Exemplo de senha segura: `Studio2026SeguroXYZ` (apenas letras e números)

### Economia de Tokens
- **Leitura única** — ler arquivo 1x, fazer todas as mudanças na memória, escrever 1x
- **StrReplaceFile preferido** — só substituir o trecho que muda, não reescrever arquivo inteiro
- **Commits agrupados** — uma única chamada de commit com todas as mudanças
- **Push somente no final da sessão** — quando o usuário pedir para encerrar/subir para produção. Durante a sessão, commit local apenas
- **Sem prints desnecessários** — resultado direto, sem mostrar código que já foi visto

### Checklist Pré-Commit Obrigatório (executar ANTES de todo commit)

> **Regra de Ouro:** nunca commitar sem passar por este checklist.

```
□ 1. ROTAS DE TESTE — grep -n "teste-\|PageV[0-9]\|V[0-9]" src/App.tsx
   → Se encontrar rotas de teste, REMOVER antes do commit
□ 2. LINKS DE TESTE — grep -in "teste\|V[0-9]" src/components/AuthLayout.tsx
   → Se encontrar links de teste no menu, REMOVER antes do commit
□ 3. ARQUIVOS ORFÃOS — arquivos .tsx sem rota/import = código morto. Remover ou justificar
□ 4. TYPE CHECK — npm run check deve passar. Zero tolerância para erros de TypeScript
□ 5. DOCUMENTAÇÃO — MEMORY.md e SESSION-CONTEXT.md refletem tudo que foi entregue?
□ 6. SELF-HEALING — novo erro/pegadinha aprendida? Adicionar na tabela de erros
```

### 🔄 Padrão de Refatoração — Páginas de Teste

> Ao refatorar página existente (layout, design system, melhoria visual), NUNCA sobrescrever a página principal direto.

1. Criar `{Nome}V2.tsx` (ou V3) em `src/pages/`, copiando a lógica original com as melhorias
2. Adicionar rota `/teste-x` em `App.tsx` + link temporário no menu (`AuthLayout.tsx`)
3. David testa local e aprova
4. Só então aplicar na página principal e **remover rota e link de teste** (checklist pré-commit itens 1 e 2)
5. Verificar "Páginas de Teste" no SESSION-CONTEXT.md ao iniciar sessão — oferecer reativar se a sessão anterior ficou pendente

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
| Mudança em segurança | `AGENTS.md` + `docs/adr/ADR-005-seguranca-padrao.md` | Arquivo isolado |
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
- **Quando David confirmar que executou a ação, marcar como `[x]` imediatamente** na mesma resposta — nunca deixar para depois

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
| 006 | Excluir registro sem confirmação (clique sem querer apagou cliente) | 06/09/2026 | **SEMPRE** AlertDialog de confirmação antes de qualquer delete, mostrando o nome do item. Nunca chamar mutation de delete direto no clique do botão |
| 007 | Placeholder longo quebrou a caixa do Select em 2 linhas | 06/09/2026 | **SEMPRE** placeholder curto + `truncate` no `SelectValue`. Reler regras de front end do AGENTS.md ANTES de criar campo novo |
| 008 | Espaço vazio grande no card de listagem | 06/09/2026 | O Card shadcn base vem com `py-6 gap-6` — em cards de listagem SEMPRE sobrescrever com `gap-1.5 py-2.5` no Card (tailwind-merge derruba o default) + header `p-4`. Ajustar só o CardHeader NÃO resolve |
| 009 | Botão ícone-sozinho entregue em funcionalidade nova (WhatsApp na Fila do dia) | 07/09/2026 | ANTES de criar tela nova, reler a seção "Botões de Ação" do AGENTS.md: texto+ícone SEMPRE, inclusive em ações por linha (usar botão compacto `px-2 py-1 text-[11px]`), cores semânticas com fundo |

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
- Tamanho: `w-full max-w-lg max-h-[80vh] overflow-y-auto` (largura total no mobile, limitada no desktop)

### Exclusão — Confirmação Obrigatória
- **SEMPRE** abrir `AlertDialog` de confirmação antes de qualquer delete — nunca chamar a mutation direto no clique
- O texto deve citar o **nome do item** (ex: "Excluir 'Maria Silva'? Essa ação não pode ser desfeita.")
- Botões: Cancelar (outline) + Confirmar exclução (`bg-red-600 hover:bg-red-700`)
- Vale para TODAS as telas: clientes, serviços, profissionais, agendamentos, financeiro, etc.

### Cards — Grid e Consistência
- **SEMPRE `h-full`** em cards do mesmo grid — alturas iguais, sem um card maior que o outro
- **Grids simétricos** (2, 3, 4 colunas) — evitar 1+2, 2+1, a menos que o conteúdo justifique
- **Estrutura consistente** entre cards do mesmo grid — se um tem header+content, todos têm
- **Zero espaço vazio sem função** — todo espaço deve ter propósito
- **Padding de listagem:** o Card base do shadcn vem com `py-6 gap-6` — em cards de listagem (grid de itens) SEMPRE sobrescrever com `className="... gap-1.5 py-2.5"` e header `p-4`. Ajustar só o CardHeader NÃO resolve (o padding do Card continua)
- Texto longo SEM espaços (URLs, telefones formatados): usar `break-all`, nunca `break-words`

### Padrão de Preview/Detalhes (item selecionado)
> Todos os previews/fichas de itens selecionados seguem o mesmo padrão visual

- **Header:** círculo colorido `w-14 h-14` com ícone `w-6 h-6` (cor da entidade) + título `text-lg font-bold text-slate-800` + badges abaixo do título (`flex-wrap gap-2`)
- **Ações:** coluna à direita, botões empilhados verticalmente (`flex-col gap-2`), todos sólidos, sempre texto + ícone
- **Grid de detalhes:** `grid grid-cols-2 lg:grid-cols-3 gap-4`
- **Labels:** `text-[10px] font-semibold text-slate-400 uppercase` | **Valores:** `text-sm font-medium text-slate-800`
- **Botão Fechar:** centralizado, `bg-slate-100 text-slate-600` + ícone `ChevronDown`
- ❌ Anti-padrões: ícone pequeno sem círculo, ações misturando sólido+outline, grid assimétrico, labels em `slate-500` (é 400)

### Abas/Filtros
- **"Todos"** → mostra tudo (incluindo pendentes)
- **"Pendentes"** → só itens com status pendente
- Badge com contador quando houver pendentes

### Mobile-First — Obrigatório
> Ao criar/modificar qualquer página, dialog, tabela, grid ou lista, SEMPRE aplicar classes responsivas. Nunca esperar o usuário pedir.

- **Alinhamento duplo obrigatório:** toda mudança deve funcionar em **mobile E desktop** sem quebra. Estouro horizontal (conteúdo cortado na direita, botão pela metade) é bug crítico — a área de conteúdo tem `min-w-0` + `overflow-x-clip` no layout justamente pra impedir isso; nunca remover
- **Touch targets:** mínimo 44px de altura
- **Inputs:** mínimo 16px de fonte | **Texto corrido:** mínimo 14px
- **Padrões responsivos mínimos:**
  - Stats: `grid grid-cols-2 lg:grid-cols-4`
  - Grids de cards: `grid sm:grid-cols-2 lg:grid-cols-3`
  - Header de página: `flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`
  - Títulos: `text-xl sm:text-2xl` | Subtítulos: `text-xs sm:text-sm`
  - Espaçamento: `space-y-4 lg:space-y-6` em sections, `p-4 lg:p-6` em cards
  - Botões lado a lado: `flex-wrap` quando necessário

### 🎯 Excelência de Produto — Método de Trabalho
> O que separa app de grande marca não é feature, é polimento + confiança. Regra permanente de trabalho do Kimi (definida com David em 12/09/2026).

1. **Benchmark antes de redesenhar** — para mudança visual/UX em qualquer tela, comparar com 2-3 referências de mercado (Booksy, Fresha, Google Calendar etc.) antes de propor; pesquisar quando necessário
2. **Checklist de excelência por página** — cada página responde: estado vazio existe e orienta? ações visíveis (texto+ícone)? tarefa em 2-3 toques? mobile+desktop? dados nunca se perdem (exclusão lógica, nomes de itens inativos continuam visíveis no histórico)?
3. **Conselho sincero sempre** — dizer quando algo está "bom para MVP" vs. quando merece investimento de polimento, com prioridade e justificativa de negócio; nunca vender trabalho desnecessário
4. **Diferencial estratégico do StudioFlow** — WhatsApp-first, reengajamento automático (cliente sumido, aniversariante, pós-atendimento), simplicidade para dono não-técnico. Decisões de produto devem fortalecer esses pilares, não seguir concorrente genérico

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
├── api/                    # Entrypoint serverless Vercel (só index.js — bundle gerado, NÃO editar)
├── server/                 # Backend tRPC + Hono
│   ├── router.ts           # Registro de routers
│   ├── middleware.ts       # publicQuery, authedQuery, adminQuery
│   ├── context.ts          # Contexto com user autenticado
│   ├── boot.ts             # Entrypoint Hono (CORS, headers, /health)
│   ├── vercel.ts           # Handler serverless para Vercel
│   ├── lib/audit.ts        # Helper de audit log
│   ├── lib/env.ts          # Variáveis de ambiente
│   ├── local-auth-router.ts # Auth (register, login, me, logout) — único auth do app
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
│   │   └── salon.ts        # Queries do negócio
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
3. Nunca modificar `server/lib/` (framework internals)
4. Novas tabelas em `db/schema.ts`, gerar migration em `supabase/migrations/`
5. Novos routers em `server/*-router.ts`, registrar em `server/router.ts`
6. Usar `server/queries/` para queries reutilizáveis
7. Operações críticas (create/update/delete) devem gerar audit log via `server/lib/audit.ts`
8. Rate limiting ativo: 100 req/min por IP, 5 req/min em auth endpoints
9. Sempre validar inputs com Zod antes de processar
10. Migrations manuais em `supabase/migrations/NNN-descricao.sql`. `schema_safe.sql` é gerado juntando todas
11. Cookies de sessão são escritos em `ctx.resHeaders` (adapter fetch tRPC) — nunca chamar `setCookie` do Hono com o ctx tRPC

**Frontend:**
1. Sempre usar `useSalon()` para obter o salão ativo
2. Desabilitar queries quando `!salon` usando `{ enabled: !!salon }`
3. Invalidar queries após mutations: `utils.customer.list.invalidate()`
4. Usar componentes shadcn/ui de `@/components/ui/*`
5. Novas páginas em `src/pages/`, registrar em `src/App.tsx`
6. **Todo campo de formulário usa a lib `@/lib/input-masks`** (padrão Brasil) — 05/09/2026:
   - Telefone → `maskPhoneBR` ((99) 99999-9999, inputMode="numeric")
   - **Toda data de formulário → `maskDateBR` (dd/mm/aaaa) — NUNCA `type="date"`** (o input nativo aceita ano com 6 dígitos, ex: 275760). Validar com `isValidDateBR` no envio; converter com `dateBRToISO`/`isoToDateBR`
   - Dinheiro → `maskMoneyBR` na tela (limite de dígitos por campo: 7 em preço de serviço) + `moneyBRToDot`/`moneyDotToBR` na conversão banco
   - Nome de pessoa → `onlyText` (só letras); nome de negócio → `onlyText(v, { allowDigits: true })`
   - Slug/URL → `maskSlug`
   - Campos numéricos (duração, comissão) → `onlyDigits` com limite de dígitos (`slice(0, N)`) — NUNCA `type="number"` solto sem máximo
7. **Texto nunca quebra a caixa** (selects, botões, badges) — 06/09/2026:
   - Placeholders de `Select`: sempre curtos ("Escolha o serviço", "Sem horários") **e** com `className="truncate"` no `SelectValue`
   - Antes de criar campo novo, reler esta seção e a de Design UX/UI — regra vale para qualquer componente novo
   - Campos de texto livre (observações, mensagens, descrições) ficam sem máscara

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
- **Infra/custos por fase:** `docs/runbooks/estrategia-infra-escala.md` — consultar antes de mexer em infra/upgrade
- **Regras de negócio (RN-NNN):** `docs/requirements/regras-de-negocio.md` — consultar antes de criar/editar funcionalidade (RN-002: violação multi-tenant = 404, nunca 403)
- **QA visual:** `docs/qa-visual-checklist.md` — rodar em 375px/1440px antes de entregar tela nova (está no DoD)
- **Melhorias de UI por página:** `docs/ui-improvements-playbook.md` — ler antes de melhorar qualquer tela (padrão aprovado na Agenda)
- **Precificação (proposta):** `docs/requirements/proposta-planos-precificacao.md` — valores pendentes de decisão do David

---

## ⚠️ Exceções ao Documento Mestre

| Regra do Mestre | Decisão no StudioFlow | Justificativa |
|-----------------|----------------------|---------------|
| Código em português | Código em inglês, comentários/docs em português | Padrão de mercado (React, tRPC, Drizzle são em inglês). Time é 1 pessoa + IA |
| Clean Architecture completa | Estrutura plana (api/, db/, src/) | MVP funcional. Clean Architecture quando o time crescer |
| Testes 80% cobertura | Meta 80%, atualmente 0% | MVP em construção. Testes após estabilização |
| Kubernetes | Vercel serverless | Custo zero, deploy rápido |
| Rate limiting 100 req/15min | 100 req/1min | Hono rate-limiter usa windowMs em ms; ajustado para MVP |
