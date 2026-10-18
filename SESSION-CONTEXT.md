# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 17/10/2026 (lote completo: consentimento + reenvio de convite + fixes mobile e botões — TUDO PUSHADO)
> **Sessão atual encerrada.** Próxima sessão: abrir um **chat novo** e dizer "continua do SESSION-CONTEXT.md" — a memória do projeto está neste arquivo + `MEMORY.md` + `AGENTS.md`, não no histórico do chat (chat longo deixa o Kimi lento; regra nova no AGENTS.md).

---

## Resumo da sessão (04/10 → 15/10) — Marca aplicada + Financeiro completo + polimentos

**Lote 17/10b — Configurações v1 (commits `b62cd98`→`4e6b974`, LOCAIS, push pendente):** proposta `docs/mockups/proposta-melhorias-configuracoes.html`. Sem migration (tudo em `salons.settings` JSON): dias de funcionamento (`workDays`), pausa/almoço (`breakStart`/`breakEnd`), antecedência mín/máx do agendamento online (só no público), toggle "pausar agendamento online" (página pública mostra aviso + CTA WhatsApp), troca de segmento com reset de tema. Settings.tsx dividida em cards. **Ficaram pra depois (anotados abaixo nas pendências):** logo (item 3), WhatsApp separado + Instagram (7), lembretes automáticos (8), CNPJ/plano (9).

**Lote 17/10 — Contraste + fix mobile + reenvio de convite (commits `d412131`→`82245fa`):**
- Fix contraste: textos secundários dos comboboxes herdam cor do contexto; `--muted-foreground` mais escuro (45%→32%)
- Fix mobile: card de termo estourava a tela (título e conteúdo) — `min-w-0` + `break-words` no padrão do ServiceCard
- Reenviar convite da equipe (proposta `docs/mockups/proposta-reenviar-convite.html`): `team.resend` (mesmo token, valida pendente/não expirado); botões "Reenviar" e "Copiar link" na lista de pendentes; sem e-mail configurado reabre a caixa do link — resolve o fluxo atual que é WhatsApp
- Infra: fluxos públicos de convite movidos pra `invite-router.ts` (regra 400 linhas), envio de e-mail extraído pra `team-invite-mail.ts`

**Lote 16/10 — Ciclo de consentimento completo (commits `12af77c`→`d3416ee`):**
- Modelos prontos de Termos: seletor "Começar de um modelo" no Novo Termo, 4 textos jurídicos em `src/components/consent/consent-templates.ts`
- Ciclo fechado (proposta `docs/mockups/proposta-ciclo-consentimento.html`): checkbox LGPD no cadastro/edição de cliente (`consentGiven`/`consentGivenAt` via client-router); aceite obrigatório no agendamento público (cliente novo entra consentido); coleta de assinatura na ficha do cliente (`ClientConsentSection.tsx` — termo renderizado com nome do cliente e do salão via `render-term.ts`, `signatureData` guarda texto + agreedAt, responsável = usuário logado); aviso âmbar de `requiresConsent` no agendamento interno; botão "Resolver" do alerta LGPD → `/clients`
**Lote 16/10 — Tela de Termos aprimorada (commits `9f73acc`→`a2a3d18`):** proposta `docs/mockups/proposta-melhorias-termos.html` aprovada na íntegra. Estado vazio com 4 atalhos que criam termo direto do modelo; desativar/reativar (coluna `isActive` que já existia) com trava: termo com assinaturas não pode ser excluído; badge "X assinaturas" por termo; card educativo LGPD recolhível. `consent.list` agora retorna inativos + count — consumidores filtram (`ClientConsentSection` filtra só ativos).
- Antes disso o alerta LGPD nunca zerava (nenhum código gravava `consentGiven = true`) e os endpoints `consent.sign`/`signaturesByClient` não tinham tela

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
- [ ] Autorizar push dos commits locais `b62cd98`→`4e6b974` (Configurações v1)
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
