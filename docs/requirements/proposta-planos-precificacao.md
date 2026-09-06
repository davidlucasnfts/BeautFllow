# Proposta de Planos e Precificação — StudioFlow

> **Data:** 06/09/2026
> **Função:** Referência única sobre precificação, planos e posicionamento
> **⚠️ STATUS: PROPOSTA — sujeita à decisão do David. Nenhum valor aqui é definitivo.**

---

## Resumo Executivo

> **Proposta inicial:** 3 planos — um gratuito como porta de entrada e dois pagos
>
> | Plano | Preço sugerido | Público-alvo |
> |---|---|---|
> | **Grátis** | R$ 0/mês | Salão começando agora, 1 profissional |
> | **Pro** | R$ 99/mês | Salão/barbearia estabelecida, até 5 profissionais |
> | **Estabelecimento** | R$ 199/mês | Clínica de estética, múltiplas unidades |
>
> **Base de cálculo:** custo de infra por salão (ver `docs/runbooks/estrategia-infra-escala.md`) — margem estimada 75-85% no Pro

---

## 1. Contexto do Nicho

Sistemas de gestão para salão/barbearia/estética no Brasil costumam cobrar entre **R$ 80 e R$ 300/mês** por unidade, geralmente com:
- Limite de profissionais ou agendamentos
- WhatsApp de confirmação como diferencial pago
- Cobrança por unidade/filial adicional

**Diferenciais do StudioFlow para justificar preço:**
- Multi-tenant nativo com isolamento real (RLS + 404 cross-tenant)
- Comunicação integrada (confirmação de agendamento)
- Onboarding simples — nicho não tolera sistema complexo

---

## 2. Por que 3 Planos?

| Argumento a favor | Argumento contra |
|---|---|
| Grátis reduz fricção de adoção (salão pequeno testa sem risco) | Plano grátis gera custo de suporte |
| Grátis vira funil natural para o Pro | Pode congestionar o free tier da infra |
| Pro vs Estabelecimento segmenta por tamanho | Decisão binária seria mais simples de vender |

**Decisão proposta:** manter os 3, mas com limites duros no Grátis (sem WhatsApp, sem relatórios) para forçar upgrade natural.

---

## 3. Os 3 Planos Propostos

### Plano Grátis

| Item | Limite proposto |
|---|---|
| **Preço** | R$ 0/mês |
| **Profissionais** | 1 |
| **Agendamentos/mês** | Até 100 |
| **Clientes na base** | Até 200 |
| **Relatórios** | ❌ Dashboard básico apenas |
| **Comunicação (WhatsApp/SMS)** | ❌ |
| **Financeiro** | ✅ Lançamentos simples |
| **Suporte** | Documentação/e-mail |
| **Audit log** | ✅ (requisito de segurança, não é diferencial) |

**Público-alvo:** autônomo começando sozinho, barbearia de 1 cadeira.

---

### Plano Pro ⭐ (foco de venda)

| Item | Limite proposto |
|---|---|
| **Preço** | R$ 99/mês |
| **Profissionais** | Até 5 |
| **Agendamentos/mês** | Ilimitado |
| **Clientes na base** | Ilimitado |
| **Relatórios** | ✅ PDF/CSV |
| **Comunicação** | ✅ Confirmação de agendamento (1 número) |
| **Financeiro** | ✅ Completo + comissões |
| **Suporte** | WhatsApp + e-mail |
| **Onboarding** | ❌ (ou pago à parte) |

**Público-alvo:** salão com 2-5 profissionais, barbearia estabelecida.

---

### Plano Estabelecimento

| Item | Limite proposto |
|---|---|
| **Preço** | R$ 199/mês |
| **Profissionais** | Ilimitado |
| **Unidades/filiais** | Até 3 |
| **Relatórios** | ✅ Avançados + comparativo entre unidades |
| **Comunicação** | ✅ Múltiplos números + campanhas segmentadas |
| **Suporte** | WhatsApp + e-mail + telefone |
| **Onboarding** | ✅ Configuração inicial inclusa |

**Público-alvo:** clínica de estética, rede de barbearias, salão grande.

---

## 4. Justificativa dos Limites

| Limite | Por quê |
|---|---|
| Profissionais como eixo de cobrança | Reflete tamanho do negócio e valor percebido — padrão do nicho |
| Agendamentos limitados só no Grátis | Evita abuso do free tier sem punir cliente pagante |
| WhatsApp só no Pro+ | Custo variável real (API por número) — não cabe no Grátis |
| Filiais no Estabelecimento | Multi-unidade é sinal claro de negócio maduro e com orçamento |
| Sem limite de clientes no Pro | Dados de cliente não custam quase nada de infra — limitar seria anti-venda |

---

## 5. Custos e Margem Estimados

Base: Supabase Pro (R$ ~135/mês) atende ~150 salões (ver estratégia de infra).

| Cenário | Salões Pro | Salões Estab. | Receita | Custo infra | Margem |
|---|---|---|---|---|---|
| 10 salões | 8 | 2 | R$ 1.190 | ~R$ 135 (Pro) | ~89% |
| 30 salões | 24 | 6 | R$ 3.570 | ~R$ 135 | ~96% |
| 60 salões | 48 | 12 | R$ 7.152 | ~R$ 270 (Pro+extras) | ~96% |

> Custo por salão cai com escala — margem melhora, não piora. Limite de 500 MB do free é o gargalo antes de qualquer receita.

---

## 6. Regras de Upgrade Propostas

| Situação | Ação |
|---|---|
| Salão passa de 1 profissional | Banner no app + e-mail oferecendo Pro (trial 7 dias) |
| Salão atinge 80% do limite de agendamentos Grátis | Alerta in-app + oferta de upgrade |
| Quer WhatsApp de confirmação | Upgrade para Pro (custou real) |
| Quer 2ª unidade | Upgrade para Estabelecimento |

---

## 7. Decisões Pendentes (⚠️ aguardando David)

| # | Decisão | Recomendação | Status |
|---|---|---|---|
| 1 | Preços finais (R$ 99 / R$ 199)? | Validar com 3-5 donos de salão reais | ⏳ Pendente |
| 2 | Plano anual com desconto? | Sim — 2 meses grátis (~17% off) | ⏳ Pendente |
| 3 | Trial do Pro gratuito? | Sim — 7 dias, sem cartão | ⏳ Pendente |
| 4 | Taxa de setup/onboarding pago? | Não — onboarding do Pro faz parte da venda | ⏳ Pendente |
| 5 | Limite do Grátis: agendamentos ou clientes? | Manter ambos (100 agend./200 clientes) | ⏳ Pendente |
| 6 | Quando implementar cobrança? | Após 10 salões ativos usando de graça | ⏳ Pendente |
| 7 | Gateway de pagamento? | Mercado Pago ou Stripe (verificar taxas no Brasil) | ⏳ Pendente |

---

## 8. Checklist para Lançar os Planos

```
□ David aprova preços e limites desta proposta
□ Validar preços com 3-5 donos de salão potenciais
□ Criar tabela `plans`/`subscriptions` no banco (migration)
□ Implementar enforcement dos limites no backend (por salonId)
□ Criar página de preços no app/marketing
□ Configurar gateway de pagamento + webhooks
□ Configurar alertas de uso (80% do limite do plano)
□ Definir upgrade/downgrade automático ou manual
```

---

> **Relacionado:** `docs/runbooks/estrategia-infra-escala.md` (custos de infra por fase) e `docs/requirements/regras-de-negocio.md` (RNs de enforcement de limites por plano, a definir).
