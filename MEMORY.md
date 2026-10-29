# StudioFlow — Histórico de Entregas

SaaS multi-tenant de gestão para salões de beleza. React 19 + TypeScript + Vite + Tailwind + shadcn/ui + tRPC/Hono + Drizzle ORM + PostgreSQL (Supabase) + Vercel.

> **Para contexto da sessão atual, ver `SESSION-CONTEXT.md`**
> **Para regras de desenvolvimento, ver `AGENTS.md`**
> **Para guia completo do projeto, ver `MestreBeaut.md`**
> **Para estrutura de documentação, ver `docs/documentacao-estrutura.md`**

---

## ✅ Entregues

> **Novo formato (a partir de outubro/2026):** cada linha descreve PRIMEIRO o valor de negócio (o que mudou para o usuário/proprietário). Detalhes técnicos (componentes, endpoints, migrations) aparecem apenas entre parênteses para quem precisar consultar depois.

| Funcionalidade | Data |
|---|---|
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
| Clientes exibidos em lista expansível na Fila do Dia, com WhatsApp e ações rápidas na lateral | 08/09 |
| Ícone oficial do WhatsApp em toda a ficha e lista de clientes | 08/09 |
| Ficha do cliente mostra aniversário com idade, última visita e histórico recente de atendimentos | 08/09 |
| Clientes ganham status automático (VIP, Sumindo, Inativo) baseado em gasto/frequência, com possibilidade de ajuste manual | 08/09 |
| Termo "Visitas" trocado por "Atendimentos" nas telas de cliente | 08/09 |
| Seletor de mês e ano em campos de data; nascimento bloqueia datas futuras | 09/09 |
| Catálogo de serviços com preço em reais, busca por nome/categoria, sugestão de categorias, duplicar serviço e seção de inativos | 12/09 |
| Ciclo completo do agendamento: iniciar atendimento, concluir com check-out financeiro, cancelar com confirmação; Dashboard mostra atendimentos do dia | 07/09 |
| Fluxo de status do atendimento simplificado: Agendado → Em andamento → Completo/Cancelado | 08/09 |
| Correção crítica na biblioteca de componentes que fazia a sidebar cobrir o conteúdo e menus não abrirem corretamente | 08/09 |
| Fila do Dia redesenhada: lista de clientes com ficha expansível, WhatsApp, Editar e Excluir — grid de cards removido | 08/09 |
| Agenda redesenhada no estilo Google Calendar, com chips coloridos por profissional, navegação central, alerta de agendamentos pendentes | 15/09 |
| Cabeçalhos da agenda ajustados para semana/dia/mês; checkout não permite valor zerado | 17/09 |
| Financeiro permite editar e excluir lançamentos, mostrar valores em real, e filtrar comissões por profissional | 19/09 |
| Termos de autorização podem ser editados, excluídos e reativados; exclusão remove assinaturas vinculadas | 19/09 |
| Profissionais ganham ficha expansível, opção de desativar/reativar, busca e campo de horários | 19/09 |
| Mensagens podem ser reenviadas e excluídas, com ficha expansível | 19/09 |
| Telas de login e cadastro ganham ícones nos botões e feedback visual de sucesso | 19/09 |
| Dados de cada salão ficam isolados: nenhum usuário acessa informação de outro estabelecimento | 26/09 |
| Campos de cliente em agendamento, financeiro e mensagens ganham busca rápida | 26/09 |
| Um agendamento pode incluir serviço principal + serviços adicionais | 26/09 |
| Controle de comissões e desempenho por profissional na fila do dia | 29/09 |
| Sistema sugere retorno de clientes após procedimentos, com card no dashboard | 29/09 |
| Formulários mantêm botões de ação sempre visíveis, mesmo rolando a página | 30/09 |
| Controle de estoque com entradas/saídas, alerta de estoque baixo e histórico | 30/09 |
| Controle de equipe: convidar funcionários por e-mail com limite por plano e permissões por papel (Free 1 / Essencial 3 / Pro 8) | 04/10 |
| Identidade visual StudioFlow aplicada em toda a plataforma, landing page e tela de login (geração de logo, ícones PWA, sidebar e skeleton) | 13/10 |
| Menu mobile sempre exibe a marca e o cartão do salão ativo | 14/10 |
| Ficha do profissional com avatar de iniciais e comissão oculta quando é zero | 15/10 |
| Cores dos profissionais na agenda atribuídas automaticamente (sem precisar escolher cor no cadastro) | 15/10 |
| Página de produtos otimizada para celular, com filtro "Só estoque baixo" e alertas visuais | 15/10 |
| Financeiro completo: controle de despesas, ganho líquido real (receita − comissões − despesas) e filtro de comissões por profissional | 15/10 |
| Kimi aplica migrations sozinho pelo script `app/scripts/apply-migration.mjs` — sem ação manual do David | 15/10 |
| Modelos prontos de termos de autorização (LGPD, procedimentos químicos, estética e uso de imagem) | 16/10 |
| Coleta de consentimento LGPD fechada: checkbox no cadastro de cliente, aceite obrigatório no agendamento online e assinatura digital na ficha do cliente | 16/10 |
| Tela de termos de autorização aprimorada: atalhos para criar do modelo, contador de assinaturas e ativar/desativar termos | 16/10 |
| Melhoria no contraste dos textos secundários para facilitar a leitura | 17/10 |
| Cards de termos ajustados para não estourar a largura no celular | 17/10 |
| Convites de equipe podem ser reenviados e copiados por link | 17/10 |
| Configurações do estabelecimento: dias/horários de funcionamento, pausa de almoço, antecedência do agendamento online e opção de pausar o link público | 17/10 |
| Tela de horários de funcionamento redesenhada com botões-pílula por dia da semana | 17/10 |
| Agendamento facilitado: cadastro rápido de cliente dentro da agenda, guia de primeiros passos (3 serviços + 3 profissionais) e lembrete de data de nascimento | 19/10 |
| Correção de erro intermitente ao salvar dados causado por conexão ociosa com o banco | 18/10 |
| Correção definitiva do erro ao editar lançamento financeiro (vírgula no campo de comissão) | 18/10 |
| Ajuste responsivo para telas de tamanho médio (tablet): KPIs, tabelas e valores monetários não quebram mais | 18/10 |
| Agendamento ganha cadastro rápido de profissional e serviço dentro do próprio formulário; serviço criado no checkout já soma no valor do atendimento | 21/10 |

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

### Padronização visual e UX (outubro)
- Cabeçalhos de todas as páginas internas com botão "Novo X" à direita na mesma linha (mobile e desktop)
- Botões de ação pastel com borda em todo o projeto; badges de status no canto direito dos cards
- Menu mobile virou hambúrguer com borda na cor do tema
- Agenda: visão Dia/Semana/Mês + navegação de data centralizadas; chips de profissional centralizados com rolagem; alerta de pendentes em todas as visões; eventos coloridos pela cor do profissional
- Financeiro: mesma barra de período centralizada; "Novo lançamento" no cabeçalho
- Dialogs com header/footer fixos e corpo scrollando; seções opcionais longas recolhíveis (ex: Cuidados e retorno no serviço)
- **Cor do serviço removida** — eventos da agenda usam a cor do profissional (configuração única)
- Busca com mensagem de "nenhum resultado" na página de Serviços
- Controle de acessos: convites de equipe com limite por plano e permissões por papel

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
