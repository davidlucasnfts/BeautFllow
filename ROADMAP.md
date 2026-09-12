# StudioFlow — Roadmap

> **Arquivo de referência.** Para contexto rápido, leia MEMORY.md primeiro.

Última atualização: 08/09/2026

---

## Plano de Progresso

> Modelo obrigatório definido em `MestreProjects.md` (seção 9).

| Fase | Nome | Status | Observação |
|------|------|--------|------------|
| 0 | Setup | ✅ | Repo, Vercel, Supabase, CI/CD, docs (05/05) |
| 1 | MVP funcional | ✅ | Dashboard, clientes, agenda, serviços, profissionais, financeiro, mensagens, termos (07/05–24/08) |
| 2 | Testes e estabilização | [~] | Feito: cadastro/login/onboarding, menu mobile, linguagem de balcão (106 textos), fix do auth, OAuth Kimi removido, migration 005 (RLS em salons). **Falta no smoke test:** cadastrar cliente/serviço/profissional, agendamento completo, financeiro |
| 3 | Produção | [~] | Produção no ar (`studioflow-navy.vercel.app`). **Falta:** push das correções, testar cadastro/login em produção, remover env vars `APP_ID`/`OWNER_UNION_ID` da Vercel, decidir destino do projeto antigo `beaut-flow` |
| 4 | Pronto para vender | ⏳ | Falta: landing pages por segmento (`/salao-de-beleza`, `/barbearia`, `/estetica`), preços definidos, domínio `studioflow.com.br` (comprar) |
| 5 | Primeiros clientes | ⏳ | — |
| 6 | Crescimento | ⏳ | — |

**Próxima ação:** completar o smoke test da Fase 2 local → push → validar Fase 3 em produção.

---

## 🎯 Passos para Sucesso do Produto (SaaS)

> Levantamento estratégico de 08/09/2026: arquitetura técnica está alinhada com o mercado (stack, segurança, processo). Os itens abaixo são os débitos que separam "app pronto" de "produto que vende".

| Ordem | Item | Por que é crítico | Status |
|-------|------|-------------------|--------|
| 1 | **Cobrança recorrente** (Stripe ou Mercado Pago) | Sem billing não é SaaS — é software gratuito. Bloqueia a Fase 5 (primeiros clientes) | ⏳ |
| 2 | **Sentry ativo em produção** | Código já integrado (`main.tsx`), mas só liga com `VITE_SENTRY_DSN` na Vercel — verificar se a env var está configurada | [~] |
| 3 | **Analytics de uso** (ex: Plausible/Umami) | Sem dados de uso não dá para saber onde o cliente trava e o que melhorar | ⏳ |
| 4 | **Onboarding guiado** (checklist "configure seu salão em 5 passos") | SaaS de sucesso reduz desistência do trial no dia 1 | ⏳ |
| 5 | **Testes E2E** (Playwright) nos fluxos críticos: login, agendar, concluir atendimento, financeiro | Cobertura unitária existe (60 testes); E2E protege o que gera receita | ⏳ |
| 6 | **Distribuição** (canal de aquisição) | Decisão de negócio do David — app bom sem canal de aquisição morre. Ligado à Fase 4 (landings por segmento) | ⏳ |

Ordem sugerida de ataque: 1 → 2 → 3 → 4 → 5 (o 6 acontece em paralelo com o negócio).

---

## Registro de Alterações

### 08/09/2026 — Página de Clientes: Ficha Expandida + Status Híbrido
- [feat] Lista padrão Fila do Dia — ficha expande na linha, WhatsApp com ícone oficial, Excluir só no card aberto
- [feat] Ficha do cliente: Aniversário dd/mm + idade, Última visita, Histórico recente (endpoint `appointment.historyByClient`)
- [feat] Status híbrido dos clientes: regras automáticas configuráveis (VIP por R$ gasto ou nº de atendimentos no mês, dias p/ Sumindo/Inativo) + seletor manual por cliente (`segmentManual`, migration 007)
- [feat] Totais reais de visitas/gasto recalculados dos agendamentos concluídos ao carregar a lista
- [refactor] Renomeação "Visitas" → "Atendimentos" nas telas de cliente
- [fix] Tailwind v4→v3 nos componentes shadcn — sidebar fixa não cobre mais o conteúdo

### 12/09/2026 — Página de Serviços (padrão design system)
- [fix] Preço exibido no padrão Brasil (`R$ 100,00`) no card e na lista de inativos
- [fix] Botões Editar/Duplicar/Excluir nas cores do design system (fundo suave, texto + ícone, empilhados)
- [fix] Checkbox nativo substituído pelo componente shadcn
- [fix] Texto "enviado automaticamente" removido dos pré/pós-cuidados (automação ainda não existe)
- [feat] Busca por nome ou categoria
- [feat] Sugestão de categorias já cadastradas enquanto digita (datalist)
- [feat] Duplicar serviço (abre formulário pré-preenchido com " (cópia)")
- [feat] Seção "Inativos" com botão Reativar (exclusão já era lógica — backend ganhou `service.reactivate`)
- [refactor] Página quebrada em componentes (`ServiceFormDialog`, `ServiceCard`) — respeita limite de 400 linhas

### 24/08/2026 — Renomeação e Segmentação (estratégia de produto)
- [feat] Renomeação concluída: BeautyFlow → StudioFlow (código, docs, metadados)
- [feat] Segmentação por tenant: salão de beleza, barbearia, clínica de estética
- [feat] Migration 003 (coluna segment em salons) + onboarding com seleção de segmento
- [feat] Labels dinâmicos por segmento (Dashboard, Clientes, Serviços, Profissionais)
- [feat] Landing page segmentada (seletor, copy, paleta de cores por segmento)
- [ok] Variáveis CSS dinâmicas por segmento na landing page

### 04/09/2026 — Hardening do Deploy e do Auth
- [fix] Backend migrado de `api/` para `server/` — build Vercel não quebra mais (tsc node16)
- [fix] Entrypoint serverless: `api/index.js` é bundle esbuild de `server/vercel.ts`, versionado no Git
- [fix] Correção do login/logout local (cookie escrito em `ctx.resHeaders`, não em ctx Hono)
- [ref] Remoção do OAuth Kimi — app 100% independente de plataforma (auth local único)
- [fix] Migration 004: constraint unique em salon_users("userId") — corrige criação de negócio no onboarding
- [feat] Favicon StudioFlow
- [dev] Novo projeto Vercel `studioflow` — produção em studioflow-navy.vercel.app
- [doc] Regra global: sempre testar local antes de produção (MestreProjects.md seção 9)

### 05/09/2026 — Consolidação e Segurança do Banco
- [doc] Arquivos mestre globais consolidados: pasta fatiada `MestreProjects/` + `MASTER_NOVO_PROJETO.md` absorvidos no `MestreProjects.md` v2.0.0 (seções 15-16, 20 erros no self-healing)
- [sec] Migration 005: RLS na tabela `salons` (lacuna da 002) — policy `tenant_isolation_salons`
- [sec] Auditoria de conformidade com o MestreProjects.md — app aprovado nos itens verificados

### 05/09/2026 — Cadastro de Cliente Sem CPF/E-mail (LGPD)
- [sec] Migration 006: remove colunas `cpf` e `email` da tabela `clients` — CPF é dado sensível sem finalidade; contato é WhatsApp no telefone
- [ref] Formulário de cliente simplificado: Nome, Telefone (WhatsApp), Nascimento, Observações
- [doc] LGPD.md, ADR-005, RF-002 e tela de Consent atualizados

### 05/09/2026 — Padrão Brasil nos Formulários
- [feat] Lib `input-masks.ts`: telefone (99) 99999-9999, data dd/mm/aaaa, dinheiro 1.234,56, texto só letras, slug
- [ref] Máscaras aplicadas em Clientes, Profissionais, Serviços, Financeiro, Onboarding e Cadastro
- [feat] Validação de data de nascimento (impede ano inválido ex: 275760)
- [dev] 24 testes novos da lib de máscaras (53 total)

### 05/05/2026 — Setup Inicial
- [dev] Projeto migrado do Kimi Web para Kimi Code
- [dev] Dependências instaladas (658 pacotes), type-check validado
- [doc] AGENTS.md, ROADMAP.md, MEMORY.md criados

### 05/05/2026 — Identidade Visual (Fase 1)
- [ok] Paleta: rosa `#E8A0BF` / dourado `#D4AF37` / fundo `#FAFAFA`
- [ok] Fontes: Playfair Display (títulos) + Inter (corpo)
- [ok] Tema dark, CSS variables, Tailwind config, Logo SVG
- [fix] Todos os textos traduzidos para português

### 05/05/2026 — Dashboard Rico (Fase 2)
- [ok] KPIs com sparklines, comparativo mês anterior, alertas visuais
- [ok] Widget próximos agendamentos, timeline de atividades

### 06/05/2026 — Migração MySQL → PostgreSQL/Supabase (Fase 3)
- [ref] Schema: mysqlTable → pgTable, mysqlEnum → pgEnum
- [ref] Driver: mysql2 → postgres-js, queries atualizadas
- [fix] Tipos Date → string, colunas inexistentes removidas

### 07/05/2026 — Alinhamento Documento Mestre
- [doc] Estrutura `docs/` criada (adr, runbooks, DOR, DOD, LGPD)
- [doc] 3 ADRs criados, CI/CD pipeline GitHub Actions
- [dev] package.json: studioflow v0.1.0, scripts quality/lint:fix/format:check
- [dev] .editorconfig, .prettierignore, vitest.config.ts (coverage 80%)
- [sec] api/boot.ts: secureHeaders, CORS restrito, /health
- [sec] Dockerfile: stage test, usuário não-root, sem .env
- [sec] api/lib/audit.ts + audit logs em routers client/appointment/financial
- [fix] Lint passando (0 erros), ESLint config com ignores corretos
- [ref] useSalon separado para fast refresh

### 12/05/2026 — Alinhamento Padrão Mestre v1.0
- [sec] Rate limiting: 100 req/min IP, 5 req/min auth (hono-rate-limiter)
- [dev] Husky: pre-commit (lint+check), pre-push (test+build)
- [doc] MEMORY.md + SESSION-CONTEXT.md + MestreBeaut.md criados
- [sec] Migrations organizadas (001-002) + schema_safe.sql idempotente
- [sec] Zod validação em 10/11 routers tRPC
- [sec] RLS policies aplicadas no Supabase
- [dev] Conexão DB recria quando DATABASE_URL muda
- [ref] Appointments.tsx refatorado (< 400 linhas)
- [doc] PRD + 3 User Stories (RF-001 a RF-003)
- [dev] CI/CD com deploy automático Vercel
- [dev] ESLint strict mode
- [dev] Testes unitários (24 testes, 3 arquivos)
- [dev] Sentry configurado (@sentry/react + @sentry/node)
- [doc] AGENTS.md atualizado com regras completas
- [doc] Runbook de processos manuais criado

### 07/05/2026 — Audit Logs Completos (RF-022)
- [sec] Audit logs adicionados em service-router.ts (create/update/delete)
- [sec] Audit logs adicionados em professional-router.ts (create/update)
- [sec] Audit logs adicionados em consent-router.ts (create form/sign)
- [sec] Audit logs adicionados em communication-router.ts (create)
- [ok] 100% dos routers críticos com auditoria

### 07/05/2026 — Calendário Profissional Fase 4.1 (RF-012)
- [feat] Componentes de calendário extraídos: WeekView, DayView
- [feat] Toggle Semana/Dia com navegação independente
- [feat] View diária com timeline horizontal (slots de 08h às 20h)
- [feat] Cards de evento com cor do serviço (border-left colorida)
- [feat] Preview do profissional no card do evento
- [feat] Cálculo automático de endTime baseado na duração do serviço
- [ref] Appointments.tsx refatorado (limite 400 linhas respeitado)

### 07/05/2026 — Landing Page que Vende (Fase 5 / RF-013)
- [feat] DashboardMockup.tsx — mockup visual do app com stats, gráfico e agenda
- [feat] TestimonialsSection.tsx — 3 depoimentos com avatares, estrelas e métricas
- [feat] HowItWorksSection.tsx — 3 passos visuais com ícones e conector
- [feat] SocialProofSection.tsx — logos de salões + badges de segurança (LGPD, SSL, ISO)
- [feat] CTASection.tsx — CTA final com benefícios e checkmarks
- [feat] Home.tsx reescrita com todos os componentes, footer expandido
- [seo] Meta tags, Open Graph, Twitter Cards, canonical, keywords, lang=pt-BR
- [ref] Componentes landing/ separados (regra 400 linhas/arquivo)

### 07/05/2026 — Auth Independente + Deploy Vercel + Supabase
- [feat] Auth local com email+senha (bcryptjs, JWT) — 100% independente de plataforma
- [feat] Tabela local_users no schema
- [ref] Remove pasta api/kimi/ (OAuth legado da plataforma geradora)
- [sec] Rate limiting em memória, sanitização de input
- [dev] Deploy Vercel: https://beaut-fllow.vercel.app/
- [dev] Supabase PostgreSQL conectado e schema aplicado
- [dev] GitHub: github.com/davidlucasnfts/BeautFllow
- [doc] Skills ativas documentadas (Security, Scalability, Cost Reducer, Self-Healing)

---

## Requisitos Funcionais

| ID | Requisito | Prioridade | Status |
|----|-----------|------------|--------|
| RF-001 | Dashboard com KPIs | Must | ✅ |
| RF-002 | CRM Clientes (CRUD) | Must | ✅ |
| RF-003 | Agendamentos (CRUD) | Must | ✅ |
| RF-004 | Cadastro de Serviços | Must | ✅ |
| RF-005 | Cadastro de Profissionais | Must | ✅ |
| RF-006 | Módulo Financeiro | Must | ✅ |
| RF-007 | Comunicação Omnichannel | Must | ✅ |
| RF-008 | Termos e Consentimentos LGPD | Must | ✅ |
| RF-009 | Landing Page | Must | ✅ |
| RF-010 | Auth (email/senha) + JWT — 100% independente | Must | ✅ |
| RF-011 | Multi-tenancy por salão | Must | ✅ |
| RF-012 | Calendário Profissional | Should | ✅ |
| RF-013 | Landing Page que Vende | Should | ✅ |
| RF-014 | Integração WhatsApp Business | Could | ⏳ |
| RF-015 | Exportação PDF de relatórios | Could | ⏳ |
| RF-016 | Notificações push | Could | ⏳ |
| RF-017 | Webhooks para agendamentos | Could | ⏳ |
| RF-018 | Relatórios e Analytics avançados | Could | ⏳ |
| RF-019 | Export CSV/Excel | Could | ⏳ |
| RF-020 | Micro-interações e UX refinada | Could | ⏳ |
| RF-021 | Revisão LGPD completa | Should | ⏳ |
| RF-022 | Logs de auditoria operacionais | Should | ✅ |
| RF-023 | Rate limiting em endpoints | Should | ✅ |
| RF-024 | Backup automático documentado | Could | ⏳ |

---

## Fases do Projeto

Status: ✅ Concluído | [~] Em andamento | ⏳ Pendente

### Fase 1: Identidade Visual — ✅ (05/05)
### Fase 2: Dashboard Rico — ✅ (05/05)
### Fase 3: Migração Supabase — ✅ (06/05)

### Fase 4: Calendário Profissional — ✅ CONCLUÍDA (07/05)

### Fase 5: Landing Page que Vende — ✅ CONCLUÍDA (07/05)

### Fase 6: Integrações — ⏳
| # | Tarefa | Status |
|---|--------|--------|
| 6.1 | WhatsApp Business API | ⏳ |
| 6.2 | Exportação PDF de relatórios | ⏳ |
| 6.3 | Notificações push | ⏳ |
| 6.4 | Webhooks para agendamentos | ⏳ |

### Fase 7: Relatórios e Analytics — ⏳
| # | Tarefa | Status |
|---|--------|--------|
| 7.1 | Faturamento por período | ⏳ |
| 7.2 | Ocupação dos profissionais | ⏳ |
| 7.3 | Serviços mais vendidos | ⏳ |
| 7.4 | Gráficos de desempenho | ⏳ |
| 7.5 | Export CSV/Excel | ⏳ |

### Fase 8: Micro-interações e UX — ⏳
| # | Tarefa | Status |
|---|--------|--------|
| 8.1 | Toasts customizados (Sonner) | ⏳ |
| 8.2 | Loaders e estados de loading | ⏳ |
| 8.3 | Hover effects e transições | ⏳ |
| 8.4 | Animações de entrada nas páginas | ⏳ |
| 8.5 | Feedback visual em formulários | ⏳ |

### Fase 9: Segurança e Compliance — ✅ CONCLUÍDA (12/05)
| # | Tarefa | Status |
|---|--------|--------|
| 9.1 | Revisão LGPD | ✅ |
| 9.2 | Logs de auditoria (audit_logs) | ✅ |
| 9.3 | Rate limiting em endpoints sensíveis | ✅ |
| 9.4 | Backup automático do banco (Supabase) | ✅ |
| 9.5 | RLS policies em todas as tabelas | ✅ |
| 9.6 | ESLint strict mode | ✅ |
| 9.7 | Husky + pre-commit/pre-push | ✅ |
| 9.8 | CI/CD com deploy automático | ✅ |
| 9.9 | Testes unitários (24 testes) | ✅ |
| 9.10 | Sentry configurado | ✅ |

---

## UX/UI (aplicar em toda implementação)

- Hero compacto (sem `min-h-screen`), conteúdo acima do fold
- Headline na dor, CTA repetido, prova social no hero
- Cores distintas por card, botões sempre visíveis
- Mobile: touch 44px+, stack vertical, menu hambúrguer

---

## Como Registrar Alterações

```
### DD/MM/YYYY — Título
- [tipo] Descrição
```

Tipos: `[feat]` Nova feature | `[fix]` Bugfix | `[ok]` Concluído | `[perf]` Performance | `[sec]` Segurança | `[doc]` Documentação | `[ref]` Refatoração | `[dev]` Configuração/DevOps

**Regras:**
1. Nunca duplicar informação entre Registro de Alterações e Fases
2. Fase concluída: substituir tabela por "✅ CONCLUÍDA (data)"
3. Tarefa concluída: marcar com ✅ e data
4. Sempre atualizar a última data no topo do arquivo
