# BeautyFlow — Product Requirements Document (PRD)

> **Data:** 12/05/2026 | **Versão:** 1.0 | **Status:** MVP

---

## 1. Contexto

### Por que estamos construindo isso?

Salões de beleza e centros estéticos no Brasil ainda gerenciam agendamentos em cadernos, planilhas ou sistemas genéricos que não entendem as particularidades do setor: comissão de profissionais, histórico de serviços por cliente, consentimentos LGPD, lembretes automáticos.

### Problema

- Agendamentos duplos e falta de organização
- Perda de clientes por falta de follow-up
- Dificuldade em calcular comissões
- Risco de não conformidade com LGPD
- Sem visão financeira consolidada

### Solução

BeautyFlow: SaaS multi-tenant de gestão completa para salões de beleza, com foco em agendamentos, CRM, financeiro e compliance LGPD.

---

## 2. Personas

| Persona | Quem é | Necessidade principal |
|---------|--------|----------------------|
| **Dono de Salão** | Gestor do negócio | Visão financeira, controle de equipe, relatórios |
| **Recepcionista** | Atende clientes e agenda | Agendamento rápido, busca de clientes, confirmações |
| **Profissional** | Faz os serviços | Ver agenda do dia, histórico do cliente, comissões |
| **Cliente** | Quem consome os serviços | Agendar online, receber lembretes, ver histórico |

---

## 3. Jornada do Usuário

### Dono de Salão

1. **Descoberta** → Landing page com proposta de valor
2. **Cadastro** → Cria conta, configura salão, adiciona profissionais
3. **Primeiro uso** → Cadastra serviços, adiciona clientes
4. **Operação diária** → Acompanha agenda, financeiro, relatórios
5. **Crescimento** → Usa campanhas de reativação, analisa métricas

---

## 4. Funcionalidades

### Must (MVP — entrega obrigatória)

| # | Funcionalidade | Descrição | Status |
|---|---------------|-----------|--------|
| M1 | Auth (OAuth + Email) | Login com Kimi OAuth e email/senha local | ✅ |
| M2 | Multi-tenancy | Isolamento por salão (salonId) | ✅ |
| M3 | Gestão de Clientes (CRM) | Cadastro, histórico, segmentação, LGPD | ✅ |
| M4 | Catálogo de Serviços | Nome, preço, duração, cor, instruções | ✅ |
| M5 | Profissionais | Cadastro, comissão, horários | ✅ |
| M6 | Agendamentos | Calendário semanal/diário, filtros, status | ✅ |
| M7 | Financeiro | Lançamentos, comissões, por profissional | ✅ |
| M8 | Comunicação | WhatsApp/SMS (estrutura para futuro) | ✅ |
| M9 | Termos LGPD | Formulários de consentimento, assinatura | ✅ |
| M10 | Dashboard | KPIs, próximos agendamentos, alertas | ✅ |

### Should (Próxima fase)

| # | Funcionalidade | Descrição |
|---|---------------|-----------|
| S1 | Relatórios PDF/CSV | Exportação de dados |
| S2 | Agenda online pública | Cliente agenda sem ligar |
| S3 | Campanhas automáticas | Reativação de clientes inativos |
| S4 | Estoque de produtos | Controle de insumos |
| S5 | Pagamentos integrados | Pix, cartão via gateway |

### Could (Futuro)

| # | Funcionalidade | Descrição |
|---|---------------|-----------|
| C1 | App mobile | Versão nativa para profissionais |
| C2 | IA para recomendações | Sugestão de serviços por cliente |
| C3 | Integração WhatsApp Business | Envio automático de mensagens |

### Won't (Fora de escopo)

| # | Funcionalidade | Motivo |
|---|---------------|--------|
| W1 | ERP completo | Foco em salões de beleza |
| W2 | Rede social | Não é o core do negócio |

---

## 5. Métricas de Sucesso

| Métrica | Meta | Como medir |
|---------|------|-----------|
| Tempo de agendamento | < 2 min | Tempo médio na tela |
| Taxa de no-show | < 15% | Agendamentos cancelados/faltas |
| Retenção de clientes | > 60% | Clientes com 2+ visitas |
| NPS | > 50 | Pesquisa pós-atendimento |
| MRR (Monthly Recurring Revenue) | R$ 10k | Assinaturas ativas |

---

## 6. Restrições

| Tipo | Restrição |
|------|-----------|
| Tempo | MVP em 4 semanas |
| Orçamento | Zero infra (Vercel + Supabase free tier) |
| Compliance | LGPD obrigatório |
| Time | 1 pessoa (David) + IA (Kimi) |
| Tecnologia | Stack definida no ADR-001 |
