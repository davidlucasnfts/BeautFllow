# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 21/10/2026 (sessões 19/10–21/10: onboarding dentro do agendamento, cadastro rápido de profissional/serviço, fix mobile. Push `6369656` em produção)
> **Sessão atual encerrada.** Próxima sessão: abrir um **chat novo** e dizer "continua do SESSION-CONTEXT.md" — a memória do projeto está neste arquivo + `MEMORY.md` + `AGENTS.md`, não no histórico do chat (chat longo deixa o Kimi lento; regra nova no AGENTS.md).

---

## Resumo das sessões (19/10–21/10) — Agendamento facilitado completo

**Sessão 19/10 — Onboarding dentro do agendamento:**
- Dono novo consegue cadastrar o primeiro cliente dentro da própria tela de agendamento, sem sair do fluxo (nome, telefone e autorização LGPD)
- Agenda ganha guia de primeiros passos: cadastrar 3 serviços e 3 profissionais, com botão "Sou eu" pra usar o próprio nome como profissional
- Diálogo de novo agendamento avisa o que ainda falta cadastrar (cliente, serviço ou profissional)
- Aba Clientes ganha filtro/badge "Sem nascimento" pra lembrar de completar a data (usada depois em relatórios e promoções de aniversário)
- Configurações ganha toggle "Mostrar guia de primeiros passos" (o dono pode desligar quando quiser)
- Ajustes: removeu botão duplicado de cadastrar cliente; banner de instalação no celular ficou mais limpo, com um botão principal e passo a passo escondido

**Sessão 21/10 — Cadastro rápido de profissional e serviço (PUSHADO):**
- Dono consegue cadastrar profissional e serviço direto dentro da tela de agendamento (padrão usado por Booksy e AgendaPro)
- Profissional: nome + comissão opcional + botão "Sou eu"
- Serviço: nome + preço + duração
- No checkout (finalizar atendimento), dá pra criar um serviço extra e o valor já entra no total automaticamente
- **Aprendizado técnico registrado:** no mobile, não se pode trocar um campo de seleção por um formulário enquanto o dropdown está aberto — isso deixava o menu "preso" na tela e travava os botões. Solução: campos sempre visíveis, mini-form aparece abaixo deles, e só um mini-form aberto por vez

## Resumo da sessão (18/10) — Configurações, acessibilidade e correções no Financeiro

**PUSH em 18/10 (17 commits):** Configurações do estabelecimento concluídas, fonte maior no desktop, redesign do horário de funcionamento e correção do erro ao editar lançamento financeiro.

**Lote 17/10b — Configurações v1:**
- Dono pode configurar dias e horários de funcionamento, pausa de almoço e antecedência do agendamento online
- Pode pausar o link de agendamento online (cliente vê aviso e é direcionado pro WhatsApp)
- Pode trocar o segmento (salão/barbearia/estética), com tema atualizado automaticamente
- **Ficaram pra depois:** upload de logo do estabelecimento, WhatsApp separado + Instagram na página pública, lembretes automáticos de WhatsApp, CNPJ/razão social e exibição do plano atual

**Lote 17/10 — Melhorias visuais + convites da equipe:**
- Textos secundários ficaram mais escuros, mais fáceis de ler
- Cards de termos de autorização ajustados pra não estourarem a tela no celular
- Convites de equipe podem ser reenviados e copiados por link (funciona bem pelo WhatsApp enquanto o domínio de e-mail não está verificado)

**Lote 16/10 — Ciclo de consentimento LGPD fechado:**
- Termos de autorização ganham 4 modelos prontos (LGPD, procedimentos químicos, estética e uso de imagem)
- Cliente novo aceita os termos no cadastro e no agendamento online
- Ficha do cliente permite coletar assinatura digital do termo
- Tela de termos mostra quantas assinaturas cada um tem e permite ativar/desativar sem perder histórico
- Antes dessa entrega, o alerta de consentimento pendente nunca zerava porque o sistema não gravava o aceite

**TUDO PUSHADO para produção em 15/10** (~31 commits). Lotes:
- **Marca (13-14/10):** logo original da IA do David é a fonte de tudo (pipeline `process-brand-logo.mjs` → `public/brand/` + ícones PWA); lockup em sidebar (desktop+mobile, drawer mobile corrigido pra sempre mostrar logo+cartão), landing, login, proposta, rodapés; SVGs recriados descartados
- **Financeiro completo (15/10, proposta aprovada `docs/mockups/proposta-melhorias-financeiro.html`):** tipo Despesa (migration 015 aplicada no banco), ganho líquido real (receita − comissões − despesas) + card Despesas, edição de profissional/comissão, mês/formas em pt-BR, seletor de mês padronizado, filtro por profissional (chips) nas Comissões
- **Polimentos (15/10):** card de profissional com avatar de iniciais + comissão oculta quando zero; cor do profissional automática (paleta rotativa, campo removido — mesmo padrão da cor do serviço); Produtos com resumo 3 colunas no mobile, filtro "Só estoque baixo", badge "Ativo" redundante removido
- **Infra (15/10):** script `app/scripts/apply-migration.mjs` — Kimi aplica migrations sozinho via DATABASE_URL do `.env` (regra salva no AGENTS.md, não precisa mais de ação manual do David)
- **Regra de processo (15/10):** AGENTS.md ampliado — qualquer melhoria em tela existente exige proposta em `docs/mockups/` + autorização explícita antes de alterar código

---

## Onde paramos — próximos passos (ordem)

1. **PUSH feito em 17/10** — tudo em produção (consentimento completo, reenvio de convite, fixes mobile e botões); Vercel deploya automático.
2. **Homologação pendente do David:** fluxo de convite da Equipe (`/equipe` → convidar → aceitar em `/convite?token=...`) — testar local antes de apresentar.
4. **Landings por segmento:** mockups aprovados em `docs/mockups/landing-segmento-*.html` → codificar rotas `/barbearia`, `/salao-de-beleza`, `/estetica`.
5. Depois: Fase 4 (billing Stripe/Mercado Pago + preços).

---

## Logo — briefing aprovado (pra não depender do chat)
- **StudioFlow** — SaaS de gestão p/ salões de beleza, clínicas de estética e barbearias
- Conceito: **beleza + fluxo** — curvas suaves/graciosas (fio de cabelo abstrato, onda, pincelada) + continuidade (a curva conecta ou leva ao nome)
- Tom: elegante, acolhedor, premium-acessível; feminino-leaning mas sóbrio
- Estilo: beleza com polimento tech — referências **Aesop, Glossier, Cal.com**; flat vector, liso em 16px (favicon) e elegante em sidebar escura
- **Paleta neutra e atemporal**: grafite/carvão `#0F172A` base + UM acento suave (rose gold, índigo suave ou sálvia). Não fazer roxo forte a identidade
- **PROIBIDO:** tesoura, pente, espelho, rosto (clichês)
- Entregável esperado da IA: símbolo + wordmark "StudioFlow" (sans humanista; "Studio" sólido, "Flow" com acento)

---

## Decisões pendentes / Ações manuais (David)

**Novas desta sessão:**
- [ ] **Configurações — ficou pra depois (da proposta `docs/mockups/proposta-melhorias-configuracoes.html`):** ① upload de logo do estabelecimento (coluna `logoUrl` já existe — precisa criar bucket no Supabase Storage + exibir na página pública e header do app); ② WhatsApp público separado do telefone + link de Instagram na página pública; ③ lembretes automáticos de WhatsApp D-1/D-0 (projeto maior: Vercel Cron + integração WhatsApp); ④ CNPJ/razão social + desativar salão + ver plano atual (quando entrar cobrança/NF)
- [ ] ~~Autorizar push dos commits locais~~ FEITO em 18/10 — tudo em produção (17 commits)
- [ ] **Homologar em produção após push 18/10:** editar lançamento no Financeiro (bug da vírgula), Configurações (dias/pausa/segmento), fonte maior no desktop
- [ ] Gerar logos na IA (Ideogram/Looka) com o prompt e enviar prints das favoritas pro Kimi
- [ ] Homologar fluxo de convite da Equipe (teste local: convidar → reenviar/copiar link → aceitar em aba anônima)
- [x] **Configurar envio de e-mail (Resend) pra convites da Equipe** — FEITO em 17/10: `RESEND_API_KEY` cadastrada na Vercel. **Limitação conhecida:** sem domínio verificado, o Resend (modo teste) só entrega e-mails para o próprio e-mail da conta — convites para terceiros caem na caixinha âmbar com link pra copiar (fluxo WhatsApp). **Pendente quando comprar o domínio:** verificar `studioflow.com.br` no Resend (criar registros DNS, ~10 min) e configurar `RESEND_FROM=StudioFlow <contato@studioflow.com.br>`

**Legadas (não esquecer):**
- [ ] Remover env vars `APP_ID` e `OWNER_UNION_ID` do projeto Vercel `studioflow` (Settings → Environment Variables) — não são mais lidas pelo código. `APP_SECRET` e `DATABASE_URL` **permanecem**
- [ ] Testar cadastro/login em produção (`studioflow-navy.vercel.app`) após o push
- [ ] **Foto/logo do estabelecimento** (coluna `logoUrl` já existe) — falta criar bucket no Supabase Storage + upload na aba Configurações
- [ ] Testar instalação do PWA em celular real (só funciona em produção/HTTPS)
- [ ] Renomear repositório GitHub `BeautFllow` → `studioflow` (opcional)
- [ ] Comprar domínio `studioflow.com.br` e configurar na Vercel (quando preparar para vender)
- [ ] Apagar usuário de teste `teste.kimi.2026@gmail.com` no Supabase (opcional)

**Migrations aplicadas direto no banco pelo Kimi** (001–014, todas ✅; convites usam `RESEND_API_KEY`/`RESEND_FROM` já configuradas)

---

## Débitos técnicos conhecidos (não urgentes)
- `server/queries/salon.ts` ~900 linhas (limite 400) — quebrar em arquivos por domínio
- `consent.create` aceita `serviceId` no Zod mas a tabela não tem a coluna (campo morto) — **ganhou propósito:** implementar vínculo termo↔serviço quando fizer o fluxo de exigência de assinatura (checkbox "Exige termo" hoje só mostra selo no card)
- `financial.create` exige `clientId` mas o schema permite null
- Mesma melhoria de "busca sem resultado" de Serviços (`7df16e7`) provavelmente se aplica a Produtos/Profissionais/Clientes — padronizar quando tocar nelas

---

## Como testar local
`cd app && npm run dev` → `http://localhost:3000`
Validações rápidas: `npm run check` (type-check) · `npm run test` (104 testes) · `npm run build`

## Bloqueios
Nenhum.
