# StudioFlow — Roadmap Estratégico

> **Última atualização:** 09/11/2026 (auditoria de concorrência + funil)
> **Versão:** 2.0 (revisão de negócio)
> **Meta atual:** Fase 4 — Pronto para vender

---

## Resumo Executivo

O **StudioFlow** é um SaaS de gestão para **salões de beleza, barbearias e clínicas de estética**. O núcleo operacional já funciona: clientes, agenda, financeiro, serviços, profissionais, estoque, termos LGPD e equipe.

O que separa o app atual de um **produto que vende** está no lado comercial e de comunicação: **cobrança recorrente**, **landing pages por segmento**, **confirmação/lembrete automático por WhatsApp** e **testes de ponta a ponta**.

> **Próxima decisão estratégica:** definir planos e preços (Free / Essencial / Pro) e escolher gateway de pagamento (Stripe ou Mercado Pago).

---

## ✅ O que já está entregue (por área de negócio)

### 1. Identidade e acesso
- Cadastro e login com e-mail e senha
- Onboarding com escolha de segmento (salão / barbearia / estética)
- Marca StudioFlow aplicada no app, landing page e tela de login
- Convites de equipe com permissões por papel (dono, gerente, recepcionista, profissional)

### 2. Gestão de clientes
- Cadastro de clientes com nome, telefone/WhatsApp e data de nascimento
- Ficha do cliente com aniversário, última visita e histórico de atendimentos
- Status automático (VIP, Sumindo, Inativo) baseado em gasto e frequência
- Coleta de consentimento LGPD e termos de autorização
- Busca rápida de cliente em agendamento, financeiro e mensagens

### 3. Agenda e atendimentos
- Agenda dia/semana/mês com visual estilo Google Calendar
- Cadastro de serviços e profissionais
- Agendamento com serviço principal + serviços adicionais
- Fluxo de status: Agendado → Em andamento → Completo/Cancelado
- Check-out financeiro vinculado ao atendimento
- Retornos programados pós-procedimento
- Link de agendamento online público para clientes

### 4. Financeiro
- Lançamentos de receita e despesa
- Controle de comissões por profissional
- Ganho líquido real (receita − comissões − despesas)
- Filtros por profissional e mês

### 5. Produtos e estoque
- Cadastro de produtos
- Entradas e saídas de estoque
- Alerta de estoque baixo

### 6. Configurações do estabelecimento
- Dias e horários de funcionamento
- Pausa de almoço
- Antecedência mínima/máxima do agendamento online
- Opção de pausar o link público
- Troca de segmento
- Tema e cores

### 7. Compliance e segurança
- Termos de autorização com modelos prontos
- Assinatura digital na ficha do cliente
- Isolamento de dados por salão
- Logs de auditoria em operações críticas
- Rate limiting e headers de segurança

---

## ⚠️ Gaps críticos para vender

| # | Gap | Por que é crítico | Prioridade |
|---|---|---|---|
| 1 | **Sem cobrança recorrente** | Sem planos pagos, o SaaS não gera receita | Must |
| 2 | **Sem landing pages por segmento** | Cliente não se identifica com copy genérica | Must |
| 3 | **Sem confirmação/lembrete por WhatsApp** | Perde o principal diferencial prometido | Must |
| 4 | **Sem testes E2E nos fluxos de receita** | Bug em produção quebra vendas e confiança | Should |
| 5 | **Sentry/Analytics não ativos** | Não sabemos onde os usuários travam | Should |
| 6 | **Sem domínio próprio** | Aparenta amadorismo e dificulta o marketing | Should |
| 7 | **Sem relatórios/exportação** | Dono não consegue extrair dados do negócio | Could |
| 8 | **Sem campanhas de reengajamento** | Clientes somem sem lembrete automático | Could |

---

## 🕵️ Concorrência direta (pesquisa 09/11/2026)

| Concorrente | Preço de entrada | Modelo | Ponto forte | Brecha pra nós |
|---|---|---|---|---|
| **Trinks** | R$ 76–89/mês | Por faixa de profissionais + marketplace | Marca tradicional, marketplace traz cliente | Caro p/ negócio pequeno; sem foco em estética |
| **Booksy** | Sob consulta | Por profissional (R$ 20/prof. extra) + marketplace | Marketplace global, UX madura | Cobra por cabeça; suporte fraco no BR |
| **Avec** | R$ 88,90/mês | Faixa de profissionais | PIX e maquininha integrados | Preço alto; pouco flexível |
| **Irrivio** | R$ 89–149/mês | Por colaborador | Agente de IA no WhatsApp | Mais caro que nossa proposta |
| **GENDA** | R$ 39,90/mês | Por faixa | Preço baixo, lembretes com confirmação | Menos completo em gestão (sem financeiro/produtos) |

**Leitura estratégica:**
- Faixa de mercado: R$ 40–150/mês. Nossa sugestão (Free / R$ 49 / R$ 97) está **abaixo da maioria** — bom pra entrada, com margem pra subir depois.
- Todos cobram por profissional ou faixa — nosso limite por plano (1/3/8 usuários) é competitivo.
- Diferenciais que a concorrência não tem: **3 segmentos num só produto** (salão + barbearia + estética), **LGPD nativa** (assinatura digital + termos), link público sem app pro cliente.
- Tendência do mercado: **IA no WhatsApp** (Irrivio já entrega). Nosso roadmap de WhatsApp automatizado é obrigatório pra não ficar pra trás.

## 🔄 Funil de conversão atual (análise 09/11/2026)

```
Descoberta → Cadastro → Criação do salão → Ativação → 1º agendamento → Hábito → Pagamento
 (landing)   (/login)  (3 campos)        (checklist)  (cadastro rápido)  (semanal)   ❌ inexistente
```

| Etapa | Estado | Atrito identificado |
|---|---|---|
| Descoberta | Landing com SEO básico | Sem ads/conteúdo; depende de indicação |
| Cadastro | Email+senha direto, sem confirmação | Sem login social; sem verificação de e-mail (bom pra conversão, ruim p/ base) |
| Criação do salão | 3 campos (nome, link, segmento) | Campo "link/slug" confunde quem não é digital |
| Ativação | Checklist 3 serviços + 3 profissionais | Pode ser desligado e nunca completado |
| 1º agendamento | Cadastro rápido de cliente inline | ✅ Sem atrito relevante |
| Hábito | Agenda, checkout, financeiro | ⚠️ Sem lembrete pro dono (só push manual) |
| Pagamento | ❌ Não existe | Sem cobrança, sem trial, sem upgrade |

**Métricas instrumentadas: nenhuma.** Sentry configurado no código mas sem DSN ativo; sem Analytics. Hoje não é possível saber em qual etapa o usuário desiste — **ligar Analytics é pré-requisito de qualquer decisão de funil.**

**Recomendações por prioridade:**
1. **Analytics antes de vender** (sem dados, o funil é cego)
2. **Confirmação automática por WhatsApp** (única etapa que todo concorrente cobre e ainda não temos)
3. **Onboarding com progresso salvo** (não deixar desligar o checklist antes de completar o básico)
4. **Trial de 14 dias no plano pago** quando a cobrança existir

## 🎯 Plano de fases até "Pronto para vender"

### Fase 3 — Estabilização e homologação (em andamento)
**Meta:** garantir que o app funciona de ponta a ponta sem erros graves.

- [ ] Smoke test completo em produção: cadastro de cliente, serviço, profissional, agendamento, checkout e financeiro
- [ ] Remover env vars obsoletas do Vercel (`APP_ID`, `OWNER_UNION_ID`)
- [ ] Ativar Sentry em produção (`VITE_SENTRY_DSN`)
- [ ] Ajustar débitos técnicos menores (lint warnings, refatorar `server/queries/salon.ts`)

### Fase 4 — Monetização e posicionamento
**Meta:** transformar o app em produto comercial.

- [ ] Definir preços e limites dos planos (Free / Essencial / Pro)
- [ ] Implementar cobrança recorrente (Stripe ou Mercado Pago)
- [ ] Criar página de preços (`/precos`)
- [ ] Criar landing pages por segmento (`/salao-de-beleza`, `/barbearia`, `/estetica`)
- [ ] Comprar e configurar domínio `studioflow.com.br`
- [ ] Adicionar Analytics (Plausible ou Google Analytics)

#### Plano detalhado da Fase 4 — Como fazer

**1. Definir planos e preços (decisão do David)**
- Quem paga: dono do salão/barbearia/estética
- Modelo: assinatura mensal com trial de 7 ou 14 dias
- Sugestão inicial:
  - **Free:** 1 usuário, 50 clientes, 100 agendamentos/mês, sem link online
  - **Essencial:** R$ 49/mês, 3 usuários, clientes ilimitados, link online, WhatsApp manual
  - **Pro:** R$ 97/mês, 8 usuários, tudo do Essencial + relatórios + lembretes automáticos
- Guardar no banco: `salons.plan` (free/essential/pro) + `salons.billingStatus` + `salons.subscriptionId`

**2. Implementar cobrança recorrente**
- **Opção A — Stripe:** cartão internacional, UX madura, webhooks confiáveis. Contra: taxa em dólar, precisa de empresa para conta brasileira.
- **Opção B — Mercado Pago:** PIX/boleto nativo, conta PJ ou PF. Contra: webhooks menos estáveis, documentação mais confusa.
- O que implementar:
  - Tela de upgrade com seleção de plano
  - Criar assinatura no gateway
  - Webhook para atualizar status no banco (pago, atrasado, cancelado)
  - Bloqueio de funcionalidades quando o plano não permite
  - Tela de "sua assinatura" com data de vencimento e histórico

**3. Página de preços (`/precos`)**
- Comparativo dos 3 planos
- Botão de teste grátis
- FAQ de dúvidas comuns
- Depoimentos de clientes fictícios ou beta

**4. Landing pages por segmento**
- Usar os mockups já aprovados: `docs/mockups/landing-segmento-salao.html`, `landing-segmento-barbearia.html`, `landing-segmento-estetica.html`
- Criar rotas `/salao-de-beleza`, `/barbearia`, `/estetica`
- Copy específica por dor de segmento (ex: barbearia fala em "corte + barba"; estética fala em "procedimentos e retornos")
- CTA para `/precos` ou trial direto

**5. Domínio próprio**
- Comprar `studioflow.com.br` (Registro.br ou Hostinger)
- Configurar DNS na Vercel (instruções aparecem no dashboard do projeto)
- Atualizar `RESEND_FROM` no Vercel para `contato@studioflow.com.br`

**6. Analytics**
- **Plausible:** simples, privativo, pago (~USD 9/mês)
- **Google Analytics 4:** gratuito, mais complexo, exibe cookie banner
- Instalar script na landing e no app; rastrear: cadastro, criação de salão, agendamento criado, upgrade de plano

### Fase 5 — Diferenciais de produto
**Meta:** entregar o que a concorrência não entrega.

- [ ] Confirmação automática de agendamento por WhatsApp (lembrete D-1/D-0 + botão confirmar)
- [ ] Indicador visual de cliente atrasado na agenda
- [ ] Reengajamento automático: cliente sumido, aniversariante e pós-atendimento
- [ ] Upload de logo do estabelecimento
- [ ] WhatsApp e Instagram na página pública de agendamento

### Fase 6 — Relatórios e exportação
**Meta:** dono consegue tomar decisão com dados.

- [ ] Relatório de faturamento por período
- [ ] Relatório de ocupação dos profissionais
- [ ] Relatório de serviços mais vendidos
- [ ] Exportação CSV/Excel

### Fase 7 — Escala
**Meta:** crescer com qualidade.

- [ ] Testes E2E (Playwright) nos fluxos críticos
- [ ] Onboarding guiado interativo no primeiro acesso
- [ ] Programa de indicação/afiliados
- [ ] App nativo / PWA aprimorado

---

## 🚀 Próximos passos imediatos (ordem recomendada)

1. **Definir planos e preços** — desbloqueia toda a Fase 4
2. **Fazer smoke test completo em produção** — validar se aguenta um cliente real
3. **Escolher gateway de pagamento** (Stripe x Mercado Pago) e implementar
4. **Criar landing pages por segmento** — cada uma com copy própria
5. **Comprar domínio** e configurar na Vercel
6. **Ativar Sentry + Analytics** — antes de começar a vender

---

## 📊 Requisitos funcionais (atualizado)

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
| RF-010 | Auth (email/senha) + JWT | Must | ✅ |
| RF-011 | Multi-tenancy por salão | Must | ✅ |
| RF-012 | Calendário Profissional | Should | ✅ |
| RF-013 | Landing Page que Vende | Should | ✅ |
| RF-014 | Integração WhatsApp Business | Must | ⏳ |
| RF-015 | Exportação PDF de relatórios | Could | ⏳ |
| RF-016 | Notificações push | Could | ✅ |
| RF-017 | Webhooks para agendamentos | Could | ⏳ |
| RF-018 | Relatórios e Analytics avançados | Should | ⏳ |
| RF-019 | Export CSV/Excel | Could | ⏳ |
| RF-020 | Micro-interações e UX refinada | Could | ⏳ |
| RF-021 | Revisão LGPD completa | Should | ✅ |
| RF-022 | Logs de auditoria operacionais | Should | ✅ |
| RF-023 | Rate limiting em endpoints | Should | ✅ |
| RF-024 | Backup automático documentado | Could | ✅ |
| RF-025 | Cobrança recorrente (planos) | Must | ⏳ |
| RF-026 | Landing pages por segmento | Must | ⏳ |
| RF-027 | Confirmação automática por WhatsApp | Must | ⏳ |
| RF-028 | Relatórios de faturamento/ocupação | Should | ⏳ |

---

## 📝 Registro de Alterações

### 06/11/2026 — Configurações, edição de agendamentos e push notifications
- [fix] Configurações: remove duplicação do card "Aparência do sistema"
- [fix] Configurações: card de horário renomeado e com explicação clara sobre regras do link de agendamento online
- [fix] Configurações: horário de funcionamento configurável de 00:00 a 23:59
- [fix] Agenda: erro ao salvar edição de agendamento (appointmentDate em formato Date ao invés de string)
- [ui] Agenda: campo "Serviços adicionais" destacado com cor do tema
- [feat] Agenda: ação "Editar" em agendamentos ativos (mobile e desktop), reaproveitando o diálogo de novo agendamento
- [feat] Notificações push: assinatura de dispositivos, service worker customizado e alerta ao dono quando cliente agenda pelo link online
- [doc] ADR-006: decisão de implementar push agora e planejar notificações por WhatsApp em seguida

### 19/09/2026 — Polimento das 5 páginas pendentes (padrão design system)
- [feat] **Financeiro:** editar e excluir lançamento (endpoints novos com audit log), ficha expansível na linha, moeda pt-BR, ações na primeira coluna
- [feat] **Termos de Consentimento:** ver texto completo (ficha expansível), editar, excluir (remove assinaturas vinculadas; endpoints novos com audit log); checklist LGPD decorativo removido
- [feat] **Profissionais:** ficha expansível, desativar/reativar (soft delete), busca, ícone correto no campo bio, input de horários de trabalho
- [feat] **Comunicação:** reenviar mensagem (form pré-preenchido) e excluir (endpoint novo com audit log), ficha expansível, cards de marketing reduzidos
- [feat] **Login/Cadastro:** ícones nos botões + toast de sucesso pós-cadastro
- Todas as páginas do app agora estão no padrão design system (auditoria 19/09)

### 08/09/2026 — Página de Clientes: Ficha Expandida + Status Híbrido
- [feat] Lista padrão Fila do Dia — ficha expande na linha, WhatsApp com ícone oficial, Excluir só no card aberto
- [feat] Ficha do cliente: Aniversário dd/mm + idade, Última visita, Histórico recente
- [feat] Status híbrido dos clientes: regras automáticas configuráveis (VIP por R$ gasto ou nº de atendimentos no mês, dias p/ Sumindo/Inativo) + seletor manual por cliente
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
- [feat] Seção "Inativos" com botão Reativar
- [refactor] Página quebrada em componentes (`ServiceFormDialog`, `ServiceCard`)

### 24/08/2026 — Renomeação e Segmentação (estratégia de produto)
- [feat] Renomeação concluída: BeautyFlow → StudioFlow (código, docs, metadados)
- [feat] Segmentação por tenant: salão de beleza, barbearia, clínica de estética
- [feat] Migration 003 (coluna segment em salons) + onboarding com seleção de segmento
- [feat] Labels dinâmicos por segmento (Dashboard, Clientes, Serviços, Profissionais)
- [feat] Landing page segmentada (seletor, copy, paleta de cores por segmento)
- [ok] Variáveis CSS dinâmicas por segmento na landing page

### 04/09/2026 — Hardening do Deploy e do Auth
- [fix] Backend migrado de `api/` para `server/` — build Vercel não quebra mais
- [fix] Entrypoint serverless: `api/index.js` é bundle esbuild de `server/vercel.ts`, versionado no Git
- [fix] Correção do login/logout local (cookie escrito em `ctx.resHeaders`)
- [ref] Remoção do OAuth Kimi — app 100% independente de plataforma (auth local único)
- [fix] Migration 004: constraint unique em salon_users("userId")
- [feat] Favicon StudioFlow
- [dev] Novo projeto Vercel `studioflow` — produção em studioflow-navy.vercel.app
- [doc] Regra global: sempre testar local antes de produção

### 05/09/2026 — Consolidação e Segurança do Banco
- [doc] Arquivos mestre globais consolidados no `MestreProjects.md` v2.0.0
- [sec] Migration 005: RLS na tabela `salons`
- [sec] Auditoria de conformidade com o MestreProjects.md

### 05/09/2026 — Cadastro de Cliente Sem CPF/E-mail (LGPD)
- [sec] Migration 006: remove colunas `cpf` e `email` da tabela `clients`
- [ref] Formulário de cliente simplificado: Nome, Telefone (WhatsApp), Nascimento, Observações
- [doc] LGPD.md, ADR-005, RF-002 e tela de Consent atualizados

### 05/09/2026 — Padrão Brasil nos Formulários
- [feat] Lib `input-masks.ts`: telefone, data, dinheiro, texto, slug
- [ref] Máscaras aplicadas em Clientes, Profissionais, Serviços, Financeiro, Onboarding e Cadastro
- [feat] Validação de data de nascimento (impede ano inválido)
- [dev] 24 testes novos da lib de máscaras

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
- [sec] Rate limiting: 100 req/min IP, 5 req/min auth
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
- [dev] Testes unitários (24 testes)
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
- [feat] DashboardMockup.tsx — mockup visual do app
- [feat] TestimonialsSection.tsx — depoimentos com avatares e métricas
- [feat] HowItWorksSection.tsx — 3 passos visuais
- [feat] SocialProofSection.tsx — logos e badges de segurança
- [feat] CTASection.tsx — CTA final com benefícios
- [feat] Home.tsx reescrita com todos os componentes
- [seo] Meta tags, Open Graph, Twitter Cards, canonical, keywords, lang=pt-BR
- [ref] Componentes landing/ separados

### 07/05/2026 — Auth Independente + Deploy Vercel + Supabase
- [feat] Auth local com email+senha (bcryptjs, JWT)
- [feat] Tabela local_users no schema
- [ref] Remove pasta api/kimi/ (OAuth legado)
- [sec] Rate limiting em memória, sanitização de input
- [dev] Deploy Vercel: https://beaut-fllow.vercel.app/
- [dev] Supabase PostgreSQL conectado e schema aplicado
- [dev] GitHub: github.com/davidlucasnfts/BeautFllow

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
