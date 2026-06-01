# BeautyFlow — Memory de Funcionalidades

> Registro de funcionalidades entregues e marcos do projeto.  
> **Regra:** apenas funcionalidades concluídas. Estado de sessão vai em `SESSION-CONTEXT.md`.

---

## Resumo Executivo

BeautyFlow é um SaaS completo de gestão para salões de beleza. MVP em construção com 8 módulos operacionais.

---

## Funcionalidades Entregues

| # | Funcionalidade | Data | Status | Observações |
|---|---------------|------|--------|-------------|
| 1 | Dashboard com KPIs | — | ✅ | Faturamento, ocupação, comparativos |
| 2 | Agendamento Inteligente | — | ✅ | Semanal/diário, filtros, multi-profissional |
| 3 | CRM de Clientes | — | ✅ | Ficha técnica, timeline, segmentação |
| 4 | Gestão de Serviços | — | ✅ | Preços, duração, profissionais habilitados |
| 5 | Gestão de Profissionais | — | ✅ | Agenda, comissões |
| 6 | Financeiro | — | ✅ | Receitas, despesas, relatórios |
| 7 | Comunicação Omnichannel | — | ✅ | WhatsApp API, templates, campanhas |
| 8 | Termos de Consentimento (LGPD) | — | ✅ | Assinatura digital, auditoria |
| 9 | **Landing Page de Proposta** | 01/06 | ✅ | Página `/proposta` para apresentação comercial |
| 10 | **Documento de Proposta Comercial** | 01/06 | ✅ | Arquivo `PROPOSTA.md` (Markdown/PDF) |

---

## Módulos do Sistema

1. Dashboard
2. Agenda (`/appointments`)
3. Clientes (`/clients`)
4. Serviços (`/services`)
5. Profissionais (`/professionals`)
6. Financeiro (`/financial`)
7. Comunicação (`/communications`)
8. Consentimentos (`/consent`)

---

## Stack Tecnológica

- **Frontend:** React 19 + Vite + Tailwind CSS + shadcn/ui + React Router
- **Backend:** tRPC + Hono + Drizzle ORM
- **Banco:** PostgreSQL (Supabase)
- **Deploy:** Vercel (serverless)
