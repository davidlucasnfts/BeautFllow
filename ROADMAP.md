# BeautyFlow — Roadmap

> **Arquivo de referência.** Para contexto rápido, leia MEMORY.md primeiro.

Última atualização: 07/05/2026

---

## Registro de Alterações

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
- [dev] package.json: beautyflow v0.1.0, scripts quality/lint:fix/format:check
- [dev] .editorconfig, .prettierignore, vitest.config.ts (coverage 80%)
- [sec] api/boot.ts: secureHeaders, CORS restrito, /health
- [sec] Dockerfile: stage test, usuário não-root, sem .env
- [sec] api/lib/audit.ts + audit logs em routers client/appointment/financial
- [fix] Lint passando (0 erros), ESLint config com ignores corretos
- [ref] useSalon separado para fast refresh

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
| RF-010 | Auth OAuth 2.0 + JWT | Must | ✅ |
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

### Fase 9: Segurança e Compliance — [~] Em andamento
| # | Tarefa | Status |
|---|--------|--------|
| 9.1 | Revisão LGPD | ⏳ |
| 9.2 | Logs de auditoria (audit_logs) | ✅ |
| 9.3 | Rate limiting em endpoints sensíveis | ✅ |
| 9.4 | Backup automático do banco | ⏳ |

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
