# MestreBeaut — Guia Completo BeautyFlow

> **Versão:** 1.0.0 | **Data:** 12/05/2026 | **Status:** Ativo
>
> Este documento consolida 100% do padrão mestre adaptado para o BeautyFlow. É o guia de referência único para todas as decisões técnicas e de negócio do projeto.

---

## 1. Visão Geral

### O que é

O **BeautyFlow** é um SaaS multi-tenant de gestão para salões de beleza e centros estéticos. Este documento consolida:
- **32 skills** — conhecimento especializado por domínio
- **17 agentes** — personas especializadas para contextos específicos
- **26 comandos slash** — automações executáveis
- **4 hooks** — validações automáticas em tempo real
- **Docs de governança** — regras, políticas e guias

### Filosofia

- **Pragmatismo sobre pureza teórica** — solução simples que funciona > elegante que o time não mantém
- **Trade-offs explícitos** — toda decisão tem custo, documente-o
- **Complexidade justificada** — microsserviços, CQRS, Event Sourcing só se o problema exigir
- **Maturidade do time importa** — adapte a complexidade ao nível real da equipe

---

## 2. Perfil do Time

**David Lucas** — analista de sistemas, não desenvolvedor. Usa Kimi Code como ferramenta principal de desenvolvimento. Tem visão de produto e negócio, mas não escreve código manualmente. Quer projetos escaláveis e profissionais. Prefere entender o "porquê" além do "como".

---

## 3. Comunicação

- **Sempre em português** — perguntas, respostas, confirmações, tudo
- **Modo direto:** resultado primeiro, sem rodeios, sem narração do processo
- Expandir explicações só se pedido explicitamente

---

## 4. Governança e Segurança

### 4.1 Políticas de Segurança (INEGOCIÁVEIS)

| # | Regra | Severidade | Status |
|---|-------|------------|--------|
| 1 | Nunca commitar credenciais, tokens, senhas ou secrets em código | CRÍTICO | ✅ `.env` no gitignore |
| 2 | Nunca usar `verify=false`, `InsecureSkipVerify`, `trustAllCertificates` | CRÍTICO | ✅ Não encontrado |
| 3 | Nunca usar `eval()`, `exec()`, `Function()` com entrada do usuário | CRÍTICO | ✅ Não encontrado |
| 4 | Nunca concatenar strings em queries SQL — usar prepared statements | CRÍTICO | ✅ Drizzle ORM |
| 5 | Nunca atribuir entrada do usuário em `innerHTML`/`dangerouslySetInnerHTML` sem sanitização | CRÍTICO | ⚠️ `chart.tsx` (shadcn/ui) — biblioteca externa |
| 6 | Nunca usar tag `latest` em imagens Docker | CRÍTICO | ✅ Não usa latest |
| 7 | Nunca logar dados sensíveis (senhas, tokens, cartões) | ALERTA | ✅ Não encontrado |
| 8 | Nunca usar CORS wildcard `*` em produção | ALERTA | ✅ Origens whitelist |
| 9 | Sempre validar inputs de API antes de processar | ALERTA | ✅ Zod em 10 routers |
| 10 | Sempre usar TLS em toda comunicação, mesmo interna | ALERTA | ⚠️ Verificar sslmode no DATABASE_URL |

### 4.2 Regras de Segurança — Padrão Kimi

#### PROIBIDO — Regras de Ouro
1. **NUNCA** hardcodear credenciais, senhas, chaves API, connection strings
2. **NUNCA** usar fallback `|| 'valor-padrao'` em variáveis de ambiente sensíveis
3. **NUNCA** expor `service_role_key` ou qualquer secret no frontend
4. **NUNCA** assumir role do usuário — sempre buscar do banco
5. **NUNCA** commitar `.env` com valores reais
6. **NUNCA** desabilitar RLS em tabelas de produção

#### Obrigatório em todo projeto
- Headers de segurança: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- Rate limiting por IP + por usuário autenticado
- Validação de TODOS os inputs com Zod (ou similar)
- RBAC funcional: buscar role real do banco no contexto da API
- RLS habilitado em todas as tabelas com dados pessoais
- Audit logs para operações sensíveis (create, update, delete, login, export)
- `npm audit` no CI/CD — falhar em vulnerabilidades HIGH/CRITICAL
- TypeScript strict (`noImplicitAny`, `strictNullChecks`)
- Conexão com banco recria quando DATABASE_URL muda (evita cache de senha antiga)

#### Checklist pré-deploy
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

### 4.3 Zero Trust

- **Autenticação**: OAuth2/OIDC para APIs públicas, JWT sessions para internas
- **Autorização**: RBAC mínimo, valide no serviço receptor
- **Secrets**: nunca em código — use Vercel Environment Variables
- **Transporte**: TLS 1.2+ obrigatório

### 4.4 Gestão de Variáveis de Ambiente

| Arquivo | Propósito | Versionado? |
|---------|-----------|-------------|
| `.env.example` | Template com placeholders | **Sim** |
| `.env` | Valores reais locais | **Nunca** |
| `.env.local` | Overrides do desenvolvedor | **Nunca** |
| `.env.prod` | Valores de produção | **Nunca** (use Vercel Dashboard) |

**Regra crítica frontend**: Variáveis `VITE_*` **nunca contêm secrets** — elas são expostas no bundle do cliente.

---

## 5. Padrões de Código e Nomenclatura

### 5.1 Idioma

- **Português** para nomes de negócio (tabelas, campos, variáveis de domínio) — *exceto no BeautyFlow onde usamos inglês por padrão de mercado*
- **Inglês** para código técnico (funções, classes, métodos, bibliotecas)
- **Commits** em português, imperativo: "Adiciona login com Google", "Corrige layout mobile"

> **Exceção BeautyFlow:** Código em inglês, comentários/docs em português. Padrão de mercado (React, tRPC, Drizzle são em inglês). Time é 1 pessoa + IA, não há barreira de idioma no código.

### 5.2 Nomenclatura

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Componentes React | PascalCase | `UserProfileCard` |
| Hooks customizados | camelCase com prefixo `use` | `useAuth` |
| Funções utilitárias | camelCase | `formatDate` |
| Constantes | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Tipos/interfaces | PascalCase com sufixo | `UserProps`, `AuthState` |
| Routers tRPC | camelCase com sufixo `Router` | `userRouter` |
| Tabelas DB | snake_case | `user_profile` |
| Colunas DB | snake_case | `created_at` |

### 5.3 Regras de Código

- **Limite de 400 linhas por arquivo.** Se ultrapassar, redistribuir em componentes/utilitários menores.
- **Funções com responsabilidade única** — máximo 50 linhas por função
- **TypeScript strict** — `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`
- **Nunca usar `any`** — usar `unknown` + type guard
- **Comentários apenas onde a lógica não é óbvia**
- **Leitura única** — ler arquivo 1x, fazer todas as mudanças na memória, escrever 1x
- **StrReplaceFile preferido** — só substituir o trecho que muda, não reescrever arquivo inteiro
- **Commits agrupados** — uma única chamada de commit com todas as mudanças
- **Sem prints desnecessários** — resultado direto, sem mostrar código que já foi visto

---

## 6. Arquitetura — Princípios e Padrões

### 6.1 Princípios Fundamentais

1. **Separação de responsabilidades** — cada camada faz uma coisa bem feita
2. **Imutabilidade preferida** — dados não mudam, criam novas versões
3. **Composição sobre herança** — componentes pequenos, reutilizáveis
4. **Fail fast** — validar na entrada, não depois de 10 chamadas

### 6.2 Padrões Arquiteturais

| Padrão | Quando usar | Quando NÃO usar |
|--------|-------------|-----------------|
| **Monolito modular** | Time pequeno (1-5 devs), domínio coeso | Múltiplos times autônomos |
| **Microsserviços** | Domínios independentes, times > 10 devs | Time pequeno, complexidade desnecessária |
| **CQRS** | Leituras e escritas com requisitos muito diferentes | CRUD simples |
| **Event Sourcing** | Auditoria completa obrigatória, reconciliação | Performance crítica de leitura |

> **Decisão BeautyFlow:** Monolito modular. MVP funcional. Clean Architecture será adotada quando o time crescer ou quando modularizarmos em microsserviços.

### 6.3 Camadas da Aplicação

```
Frontend (React 19 + TypeScript)
    ↓ HTTP/tRPC
API Gateway / BFF (Hono + tRPC)
    ↓
Serviços de Domínio (routers tRPC)
    ↓
Repositórios / ORM (Drizzle ORM)
    ↓
Banco de Dados (PostgreSQL / Supabase)
```

---

## 7. Stack Tecnológica

### Stack Padrão — SaaS Full-Stack

| Camada | Tecnologia | Versão | Status |
|--------|-----------|--------|--------|
| **Frontend** | React | 19+ | ✅ |
| **Linguagem** | TypeScript | 5.x (strict mode) | ✅ |
| **Estilização** | Tailwind CSS | 3.x | ✅ |
| **Componentes UI** | shadcn/ui | latest | ✅ |
| **Build** | Vite | 5+ | ✅ |
| **Roteamento** | React Router | 6.x | ✅ |
| **Estado Cliente** | Zustand / Context | — | ✅ useSalon |
| **Estado Servidor** | TanStack Query | 5.x | ✅ |
| **Formulários** | React Hook Form + Zod | latest | ✅ |
| **API** | tRPC + Hono | 11.x / latest | ✅ |
| **ORM** | Drizzle ORM | latest | ✅ |
| **Banco** | PostgreSQL (Supabase) | 15+ | ✅ |
| **Auth** | OAuth 2.0 Kimi + Local JWT | latest | ✅ |
| **Deploy** | Vercel | latest | ✅ |
| **Testes** | Vitest + React Testing Library | latest | ⚠️ 0% |

---

## 8. Documentação de Negócio

### 8.1 Product Requirements Document (PRD)

Todo projeto deve ter um PRD com:

1. **Contexto** — por que estamos construindo isso?
2. **Personas** — quem usa? quem paga?
3. **Jornada do usuário** — passo a passo do problema à solução
4. **Funcionalidades** — lista priorizada (Must/Should/Could/Won't)
5. **Métricas de sucesso** — como sabemos que funcionou?
6. **Restrições** — tempo, orçamento, compliance

> **Status BeautyFlow:** ❌ PRD não existe. Criar em `docs/requirements/PRD.md`.

### 8.2 User Stories

Formato: `Como [persona], quero [ação], para que [benefício]`

Critérios de aceitação:
- Dado [contexto], quando [ação], então [resultado esperado]
- Mínimo 3 cenários: happy path, erro, edge case

> **Status BeautyFlow:** ❌ User Stories não existem. Criar em `docs/requirements/`.

---

## 9. Documentação Técnica

### 9.1 Architecture Decision Records (ADRs)

Todo projeto deve ter ADRs para decisões significativas:

```markdown
# ADR-XXX: Título da Decisão

**Data:** YYYY-MM-DD
**Status:** Proposta / Aceita / Depreciada / Substituida
**Decisores:** Nome1, Nome2

## Contexto
[Por que precisamos decidir isso?]

## Decisao
[O que decidimos?]

## Alternativas Consideradas
| Alternativa | Pros | Contras |
|-------------|------|---------|
| Opcao A | ... | ... |
| Opcao B | ... | ... |
| **Opcao escolhida** | ... | ... |

## Consequencias
- Positivas
- Trade-offs
- Negativas
```

> **Status BeautyFlow:** ✅ 5 ADRs criados (001-005).

### 9.2 Documentação de API

- tRPC: types são a documentação (type-safe end-to-end)
- REST OpenAPI: usar Swagger/OpenAPI 3.0
- GraphQL: schema introspectível

> **Status BeautyFlow:** ✅ tRPC type-safe.

---

## 10. Testes e Qualidade

### 10.1 Pirâmide de Testes

```
       /\
      /  \
     / E2E \        -- Playwright -- fluxos críticos (login, checkout)
    /--------\
   /Integracao\     -- Vitest + MSW -- routers, hooks, services
  /------------\
 / Unitarios    \   -- Vitest -- utilitários, parsers, validações
/--------------/
```

### 10.2 Cobertura Mínima

| Tipo | Cobertura | Ferramenta | Status |
|------|-----------|------------|--------|
| Unitários | 80% linhas | Vitest | ❌ 0% |
| Integração | 60% funções | Vitest + MSW | ❌ 0% |
| E2E | Fluxos críticos | Playwright | ❌ 0% |

### 10.3 Qualidade de Código

- **ESLint** — regras strict, sem warnings
- **Prettier** — formatação automática
- **TypeScript strict** — zero `any`
- **Husky + lint-staged** — pre-commit hooks

> **Status ESLint:** ⚠️ Usa `recommended`, não `strict`.

---

## 11. Infraestrutura e DevOps

### 11.1 Deploy Padrão

- **Vercel** para frontend e API serverless
- **Supabase** para PostgreSQL, Auth, Storage

### 11.2 Variáveis de Ambiente por Ambiente

| Ambiente | `.env` | `DATABASE_URL` | `NODE_ENV` |
|----------|--------|----------------|------------|
| Local | `.env` | localhost/Supabase | development |
| Preview | Vercel | Supabase | preview |
| Produção | Vercel | Supabase | production |

### 11.3 Monitoramento

- **Vercel Analytics** — performance web
- **Supabase Dashboard** — queries lentas, uso de storage
- **Sentry** — erro tracking (recomendado)

> **Status Sentry:** ❌ Não configurado.

---

## 12. CI/CD e Deploy

### 12.1 Pipeline GitHub Actions

```yaml
name: CI/CD
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npm run check

  test:
    name: Testes
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run test

  security:
    name: Auditoria de Seguranca
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm audit --audit-level=moderate

  deploy:
    name: Deploy Vercel
    runs-on: ubuntu-latest
    needs: [test, security]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run build
      - name: Deploy to Vercel
        run: npx vercel --token ${{ secrets.VERCEL_TOKEN }} --prod --yes
```

> **Status BeautyFlow:** ⚠️ Falta job `deploy` no CI.

---

## 13. Hooks e Automação

### 13.1 Pre-commit (Husky)

```bash
# .husky/pre-commit
cd app
npm run lint
npm run check
```

### 13.2 Pre-push

```bash
# .husky/pre-push
cd app
npm run test
npm run build
```

> **Status BeautyFlow:** ✅ Configurado.

---

## 14. Checklist de Adoção

### 14.1 Novo Projeto

- [x] Criar repositório GitHub
- [x] Configurar Vercel project
- [x] Configurar Supabase project
- [x] Copiar `.env.example` e preencher `.env`
- [x] Configurar Husky + lint-staged
- [x] Configurar GitHub Actions (CI/CD)
- [x] Criar `AGENTS.md` com regras do projeto
- [x] Criar `MEMORY.md` para histórico
- [x] Criar `SESSION-CONTEXT.md` para estado atual
- [x] Criar `MestreBeaut.md` (este arquivo)
- [x] Criar primeira ADR (stack escolhida)
- [ ] Habilitar RLS em todas as tabelas (aplicar migration no Supabase via `npm run db:migrate`)
- [x] Configurar headers de segurança
- [x] Adicionar rate limiting

### 14.2 Novo Desenvolvedor no Time

- [x] Ler `AGENTS.md`
- [x] Ler `README.md`
- [x] Configurar `.env` local
- [x] Rodar `npm install` e `npm run dev`
- [ ] Rodar `npm run test` (deve passar) — ❌ 0 testes
- [x] Fazer primeiro commit em branch de teste

---

## 15. Como o Kimi Deve Tomar Decisões

### 15.1 Princípio Fundamental

**Se há uma decisão técnica óbvia, tome-a e execute. Não pergunte.**

Exemplos de decisões que o Kimi deve tomar sozinho:
- Onde colocar um novo arquivo (pasta correta)
- Se um arquivo está muito grande e precisa ser dividido
- Se informação está duplicada e precisa ser consolidada
- Qual nome dar a uma função/componente
- Se usar interface ou type
- Se extrair um utilitário reutilizável
- Onde documentar uma mudança

### 15.2 Quando PERGUNTAR (exceções)

Só perguntar ao David quando:
1. **Muda o comportamento do produto** visível ao usuário
2. **Remove uma funcionalidade** existente
3. **Muda a stack tecnológica** (adicionar nova biblioteca, trocar framework)
4. **Custo significativo** — adicionar serviço pago, aumentar infraestrutura
5. **David explicitamente pediu opções** na conversa

### 15.3 Padrão de Execução

1. Identifique o problema
2. Escolha a melhor solução (simples, escalável, consistente com o projeto)
3. Execute
4. Informe David do resultado (o que foi feito e por que, em 1-2 frases)

---

## 16. Self-Healing — Aprender com Erros

### 16.1 Conceito

Self-healing é a capacidade de aprender com erros e nunca repeti-los. Cada erro cometido deve ser:
1. Registrado com data e descrição
2. Analisado (causa raiz)
3. Transformado em prevenção
4. Adicionado ao checklist obrigatório

### 16.2 Checklist Obrigatório (antes de qualquer ação)

```
□ 1. Já existe arquivo com essa função? (ver docs/documentacao-estrutura.md)
□ 2. Estou no diretório correto? (nunca modificar fora do working dir sem confirmar)
□ 3. Vou usar StrReplaceFile ou WriteFile? (preferir StrReplaceFile sempre)
□ 4. Se criar arquivo novo, adicionei no docs/documentacao-estrutura.md?
□ 5. Se modificar arquivo, atualizei todos que referenciam ele?
□ 6. Onde devo salvar? AGENTS.md (projeto) ou MestreProjects.md (global)?
□ 7. Execute npm run check após mudanças?
```

### 16.3 Regras de Ouro

1. **NUNCA** criar arquivo de documentação sem verificar se função já existe
2. **NUNCA** usar `WriteFile overwrite` em arquivos fora do working directory
3. **NUNCA** duplicar informação entre arquivos
4. **NUNCA** salvar no `MestreProjects.md` sem explicitamente ser "para todos os projetos"
5. **SEMPRE** executar checklist antes de criar/modificar/deletar
6. **SEMPRE** preferir `StrReplaceFile` sobre `WriteFile`
7. **SEMPRE** consultar `docs/documentacao-estrutura.md` antes de nova documentação

### 16.4 Erros Registrados

| # | Erro | Data | Prevenção |
|---|------|------|-----------|
| 001 | Criar arquivo sem verificar se função já existe | 11/05/2026 | Consultar `docs/documentacao-estrutura.md` antes |
| 002 | Sobrescrever arquivo fora do repo Git | 11/05/2026 | Nunca usar `overwrite` fora do working dir |
| 003 | Duplicar informação de segurança | 10/05/2026 | Expandir arquivo existente, nunca criar duplicata |
| 004 | Salvar no `MestreProjects.md` em vez de `AGENTS.md` | 11/05/2026 | Só salvar no global quando David disser "para todos os projetos" |

---

## 17. Regras de Design UX/UI

### 17.1 Design System Base

- **shadcn/ui** como biblioteca principal de componentes
- **Tailwind CSS** para estilização
- **Radix UI** como base de acessibilidade
- **Lucide React** para ícones

### 17.2 Botões de Ação — REGRAS OBRIGATÓRIAS

#### PROIBIDO: Dropdown de 3 pontinhos (MoreHorizontal)
- **NUNCA** usar `<DropdownMenu>` com `<MoreHorizontal>` para esconder ações
- Todas as ações devem ser botões de ícone visíveis diretamente
- Sem exceções

#### Visibilidade
- **Sempre visíveis** — nunca usar `opacity-0` + `group-hover:opacity-100`
- Botões de ação devem estar disponíveis imediatamente, sem precisar de hover

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
- Ícone `w-3 h-3` à esquerda do texto

### 17.3 Tabelas — Posicionamento Unificado

- **Coluna de Ações na primeira posição** (antes do nome)
- **TODAS as ações na mesma coluna** — não separar em colunas diferentes
- Pendentes: botões empilhados verticalmente (Aprovar em cima, Recusar embaixo)
- Normais: botões empilhados verticalmente (Ver, Editar, Link, Excluir)
- Status com badges coloridos: `ativo`=verde, `pendente`=âmbar, `inativo`=cinza
- **NUNCA** deixar coluna vazia no final da tabela
- **Hover azul**: `hover:bg-blue-50/50` em todas as linhas de tabela
- **Clique na linha** → abre preview/detalhes (quando aplicável)
- Botões de ação usam `stopPropagation` para não disparar o clique da linha

### 17.4 Modal/Dialog

- Cancelar: `variant="outline"`
- Confirmar/Salvar: `bg-blue-600 hover:bg-blue-700`
- Excluir: `bg-red-600 hover:bg-red-700`
- Aprovar: `bg-green-600 hover:bg-green-700`

### 17.5 Cores do Projeto (Tailwind)

| Uso | Cor |
|---|---|
| Primária (ações principais) | `blue-600` |
| Sucesso | `green-600` |
| Perigo/Excluir | `red-600` |
| Aviso/Pendente | `amber-600` |
| Líder | `purple-600` |
| Texto principal | `slate-800` |
| Texto secundário | `slate-500` |
| Fundo página | `slate-50` |
| Fundo card | `white` |

---

## 18. Onde Salvar Cada Tipo de Mudança

| Tipo de mudança | Onde salvar | Nunca salvar em |
|-----------------|-------------|-----------------|
| Funcionalidade entregue | `MEMORY.md` (tabela + resumo) | `SESSION-CONTEXT.md` |
| Estado atual da sessão | `SESSION-CONTEXT.md` | `MEMORY.md` |
| Regra de codificação nova | `AGENTS.md` | Arquivo qualquer |
| Decisão arquitetural | `docs/adr/ADR-NNN-nome.md` | `AGENTS.md` sozinho |
| Padrão para todos os projetos | `MestreProjects.md` | Dentro de projeto |
| Mudança em segurança | `AGENTS.md` + `docs/adr/ADR-005-seguranca-padrao.md` | Arquivo isolado |
| Estrutura de documentação | `docs/documentacao-estrutura.md` | Outro lugar |
| Guia completo do projeto | `MestreBeaut.md` (este arquivo) | Outro lugar |

---

## 19. Ações Manuais — REGRA CRÍTICA

- **Sempre que uma funcionalidade exigir ação manual** (rodar SQL no Supabase, configurar secret no GitHub/Vercel, criar bucket, env var, etc.), **adicionar em "Decisões pendentes" do `SESSION-CONTEXT.md`**
- **Sempre avisar David no final da resposta** com destaque em negrito e emoji ⚠️
- Nunca assumir que ele "já sabe" — ele não escreve código e não acompanha infraestrutura
- Itens pendentes devem ser claros: **o quê**, **onde fazer**, **como fazer**

---

## 20. Datas em Funcionalidades

- **Sempre incluir a data de entrega** ao lado do nome da funcionalidade em `MEMORY.md` e `ROADMAP.md`
- Formato: `Funcionalidade — DD/MM` (ex: `Relatórios PDF/CSV — 06/05`)
- Funcionalidades antigas sem data definida podem ficar sem data
- Atualizar datas ao concluir novas melhorias
