# SESSION-CONTEXT — Estado Atual do Projeto

> **Atualizado em:** 13/10/2026 (logo oficial aplicada — ver item 1 dos próximos passos)
> **Sessão atual encerrada.** Próxima sessão: abrir um **chat novo** e dizer "continua do SESSION-CONTEXT.md" — a memória do projeto está neste arquivo + `MEMORY.md` + `AGENTS.md`, não no histórico do chat (chat longo deixa o Kimi lento; regra nova no AGENTS.md).

---

## Resumo da sessão (04/10 → 13/10) — Lote de padronização visual + polimento de Serviços

**13 commits locais NA `main`, ainda NÃO pushados** (push somente quando David pedir):
1. `dea5e35` — Cabeçalhos de Clientes, Serviços, Profissionais, Produtos, Termos e Equipe padronizados (botão "Novo X" à direita na mesma linha, mobile e desktop)
2. `7df16e7` — Serviços: mensagem de busca sem resultado + seção Inativos respeita o filtro
3. `34b041a` + `6ee2778` — Dialog de serviço: seção recolhível "Cuidados e retorno", textareas, microcopy; regra salva no AGENTS.md (Modal/Dialog)
4. `062f464` + `2d5db0a` — **Cor do serviço removida** — eventos da agenda passam a usar a **cor do profissional** (configuração única de cor); MEMORY.md atualizado
5. `034673d` + `ff036f6` + `65c9464` — Card "Agendamentos de hoje" do Dashboard: botão "Ver agenda" com texto, em linha própria alinhado à direita (card estreito: título 160px + botão 95px não cabem na mesma linha de ~200px — decisão registrada)
6. `e948cb6` — **Alerta de atendimentos pendentes também nas visões Semana e Mês** (era só Dia); botão "Ver dia" troca pra visão Dia (JÁ PUSHADO em 04/10)
7. `0fae8f6`/`4820f73` — Financeiro: barra Dia/Semana/Mês + navegação centralizadas (padrão da Agenda), "Novo lançamento" no cabeçalho
8. Anteriores já pushados em 04/10: controle de acessos (equipe/convites/permissoes), plano free no cadastro, menu hambúrguer com borda do tema, badges à direita em Clientes/Comunicações/Equipe, botões "Novo" com gap-1.5, centralização da agenda, nomes capitalizados (migration 013)

**Arquivos de logo criados em `docs/mockups/`** (não commitados ainda, commitar na próxima ação): `logo-conceito-a/b/c` + `logo-comparativo.html`

---

## Onde paramos — próximos passos (ordem)

1. **LOGO ✅ APLICADA (13/10):** David escolheu a marca "fios dourados em fluxo" (gerada por IA, print no chat). Kimi recriou em SVG vetorial e aplicou: `public/logo.svg` (claro), `logo-dark.svg` (escuro), `logo-icon.svg` (símbolo), PNGs via `scripts/generate-brand-icons.mjs` (sharp, devDep). Componente `src/components/BrandMark.tsx` (cor FIXA `#B3A18A`, nunca segue o tema — regra da marca). Aplicado em: favicon (svg+png32), apple-touch-icon, ícones PWA (manifest em `boot.ts` agora usa ícone padrão; só `theme_color` do navegador segue o tema), sidebar (`AuthLayout`, fonte Comfortaa via Google Fonts), navbar da landing (`Home.tsx`), rodapés e **tela de Login** (logo horizontal acima do card). Ícones antigos por tema em `public/themes/` ficaram órfãos (não usados; deletar quando conveniente). Se o David tiver o arquivo original da IA em alta qualidade, pode substituir os SVGs mantendo os mesmos caminhos
2. **PUSH pendente:** 13 commits locais esperando autorização do David → Vercel deploya automatico.
3. **Homologação pendente do David:** fluxo de convite da Equipe (`/equipe` → convidar → aceitar em `/convite?token=...`) — testar local antes de apresentar.
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
- [ ] Gerar logos na IA (Ideogram/Looka) com o prompt e enviar prints das favoritas pro Kimi
- [ ] Homologar fluxo de convite da Equipe (teste local)
- [ ] Autorizar push dos 13 commits locais

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
