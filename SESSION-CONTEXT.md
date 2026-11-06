# SESSION-CONTEXT — Estado Atual do Projeto

> **Handoff — 02/11/2026:** O David está migrando a continuidade do projeto para outra IA. Esta é a versão mais recente do estado do projeto. A próxima IA deve começar lendo os arquivos listados abaixo e seguir estritamente o `AGENTS.md`.

> **Prompt recomendado para a nova IA:**
> "Você está assumindo o projeto StudioFlow. Leia obrigatoriamente: `AGENTS.md`, `SESSION-CONTEXT.md`, `ROADMAP.md`, `MEMORY.md` e `docs/documentacao-estrutura.md`. Siga todas as regras do `AGENTS.md`. Responda sempre em português, modo direto, priorizando linguagem de negócio. Antes de criar ou modificar qualquer arquivo de documentação, consulte `docs/documentacao-estrutura.md`. A meta atual é a Fase 4 — Pronto para vender. As decisões pendentes do David estão na seção 'Decisões pendentes / Ações manuais' deste arquivo."

> **Atualizado em:** 06/11/2026 (configurações ajustadas, edição de agendamentos, notificações push e ajustes pós-teste implementados. Último push em produção: 06/11)
> **Sessão atual encerrada.** Próxima sessão: abrir um **chat novo** e dizer "continua do SESSION-CONTEXT.md" — a memória do projeto está neste arquivo + `MEMORY.md` + `AGENTS.md` + `ROADMAP.md` + `MestreStudioFlow.md`, não no histórico do chat.

---

## Resumo da sessão 06/11 — Configurações, edição de agendamentos e push notifications

**Configurações:**
- Removida a duplicação do card "Aparência do sistema" na tela de configurações.
- Card de horário renomeado para "Horário de funcionamento e agendamento online" e ganhou explicação clara de que as regras valem para o link público; na agenda interna o dono agenda livremente.

**Edição de agendamentos:**
- Ação "Editar" adicionada em todos os agendamentos ativos (scheduled, confirmed, checked_in, in_progress) no mobile (Fila do Dia) e desktop (semana/dia).
- Reaproveitado o diálogo de novo agendamento no modo edição, permitindo alterar cliente, profissional, serviço, serviços adicionais, data, horário e observações.
- Valor e comissão continuam sendo ajustados no checkout/financeiro, não no diálogo de edição.

**Horário de funcionamento:**
- Abertura e fechamento agora podem ser configurados de `00:00` a `23:59`, permitindo qualquer jornada (inclusive 24h).

**Serviços adicionais:**
- Campo ficou destacado com cor do tema para não passar despercebido.
- Chips/tags de serviços adicionais já selecionados agora usam a cor do tema do estabelecimento (ex.: rosa para salão, preto/dourado para barbearia, lilás para estética) em vez de cinza padrão.

**Correção de bug:**
- Erro ao salvar edição de agendamento corrigido: `appointmentDate` estava sendo convertido para `Date` no backend, mas a coluna do banco espera string. Agora a edição salva corretamente.

**Notificações push no celular (Opção A implementada):**
- Nova tabela `push_subscriptions` (migration 016) para guardar assinaturas de dispositivos.
- Novo router `push` com endpoints para obter chave pública VAPID e registrar/cancelar assinatura.
- Service worker customizado (`src/sw.ts`) com suporte a eventos `push` e `notificationclick`.
- Registro explícito do service worker no `main.tsx` via `virtual:pwa-register` para funcionar em dev e produção.
- Card "Notificações no celular" em Configurações para o dono ativar/desativar push.
- Timeout no carregamento do service worker evita que o botão fique travado.
- Quando uma cliente agenda pelo link online, o salão recebe notificação push com nome, procedimento, data e horário.
- Variáveis de ambiente VAPID adicionadas ao `.env.example`.

**Próxima etapa:** decidir provedor e arquitetura da Opção B (notificação por WhatsApp para o dono), documentada em `docs/adr/ADR-006-notificacoes-push-e-whatsapp.md`.

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

1. **Análise de negócio concluída (02/11)** — ROADMAP estratégico reescrito. Meta atual: **Fase 4 — Pronto para vender**.
2. **Próxima decisão do David:** definir planos e preços (Free / Essencial / Pro) e escolher gateway de pagamento (Stripe ou Mercado Pago). Sem isso, não dá para implementar cobrança.
3. **Smoke test em produção:** validar cadastro de cliente → serviço → profissional → agendamento → checkout → financeiro.
4. **Landings por segmento:** mockups aprovados em `docs/mockups/landing-segmento-*.html` → codificar rotas `/salao-de-beleza`, `/barbearia`, `/estetica`.
5. **Ativar Sentry + Analytics** antes de abrir para clientes pagantes.
6. **Decisões operacionais pendentes:** ver seção abaixo.

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

**Prioridade 1 — bloqueiam a venda:**
- [ ] **Definir planos e preços:** Free (1 usuário), Essencial (R$ ?/mês), Pro (R$ ?/mês). Quais limites por plano?
- [ ] **Escolher gateway de pagamento:** Stripe (melhor UX, taxa em dólar) ou Mercado Pago (mais barato, PIX/boleto nativo)?
- [ ] **Comprar domínio `studioflow.com.br`** e configurar na Vercel

**Prioridade 2 — segurança e monitoramento:**
- [ ] **Ativar Sentry:** criar projeto em sentry.io e adicionar `VITE_SENTRY_DSN` no Vercel
- [ ] **Ativar Analytics:** escolher Plausible (pago, privativo) ou Google Analytics 4 (gratuito)
- [ ] **Remover env vars obsoletas do Vercel:** `APP_ID` e `OWNER_UNION_ID` (Settings → Environment Variables). `APP_SECRET` e `DATABASE_URL` **permanecem**

**Prioridade 3 — diferenciais de produto:**
- [ ] **WhatsApp automatizado:** escolher provedor (WhatsApp Business API oficial, Wati, Evolution API, Z-API). Projeto envolve Vercel Cron + envio de mensagens.
- [ ] **Logo do estabelecimento:** criar bucket no Supabase Storage e habilitar upload na aba Configurações
- [ ] **WhatsApp/Instagram na página pública:** separar do telefone do salão

**Prioridade 4 — polimento:**
- [ ] **Gerar logos na IA** (Ideogram/Looka) com o briefing e enviar prints das favoritas pro Kimi
- [ ] **Testar instalação do PWA** em celular real (só funciona em produção/HTTPS)
- [ ] **Renomear repositório GitHub** `BeautFllow` → `studioflow` (opcional)
- [ ] **Apagar usuário de teste** `teste.kimi.2026@gmail.com` no Supabase (opcional)

**Já feito:**
- [x] Push 18/10 em produção (Configurações v1, fixes Financeiro)
- [x] Push 21/10 em produção (cadastro rápido profissional/serviço)
- [x] Envio de e-mail (Resend) configurado na Vercel para convites de equipe — lembrar: sem domínio verificado, e-mails de terceiros caem na caixa âmbar; quando comprar `studioflow.com.br`, verificar domínio no Resend e configurar `RESEND_FROM=StudioFlow <contato@studioflow.com.br>`

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
