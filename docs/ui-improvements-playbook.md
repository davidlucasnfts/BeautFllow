# Playbook de Melhorias de UI — padrão da página de Agendamento

> **Quando ler:** antes de iniciar a rodada de melhorias de QUALQUER outra página (Clientes, Serviços, Profissionais, Financeiro, Mensagens, Termos, Configurações). Este arquivo registra o padrão que foi aplicado e aprovado na página de **Agendamento** (set/2026) — replique o que fizer sentido na página em questão, sempre confirmando escolhas de design com o David antes de aplicar (ele escolhe entre opções apresentadas).

---

## 1. Layout e espaço

- **App enxuto:** zero espaço vazio sem função; espaçamentos compactos (`gap-1.5 py-2.5` em cards de listagem, ver erro #008).
- **Lista mobile = linhas com ações à direita** (padrão "fila do dia"): hora grande fixa à esquerda, conteúdo central truncável (`min-w-0 flex-1 truncate`), coluna direita horizontal (`flex-row items-center gap-1.5`) com badge de status + ação rápida.
- **Coluna direita nunca em pilha vertical** — fica pequena demais e gera clique errado.
- **Ações expandidas:** botões compactos alinhados à direita, largura do conteúdo (não `flex-1` gigante), hierarquia de peso (ver item 4).

## 2. Navegação e atalhos

- **Board na Dashboard** com o resumo do dia + clique navegando pra aba (facilita a navegação do usuário).
- **Calendário de seleção rápida:** faixa/carrossel de dias com scroll automático pro dia selecionado (default = hoje, sempre visível sem deslizar).
- Trocar de contexto com 1 toque; estados vazio claros ("Nenhum agendamento neste dia.").

## 3. Formulários e dialogs

- **DatePicker (calendário visual) em TODOS os campos de data** — nada de digitar data (componente: `app/src/components/DatePicker.tsx`).
- **Dialog sempre abre com estado limpo:** `resetForm()` ao abrir (`onOpenChange` com `v === true`), depois setar valores iniciais. Estado de check-out/dialog reinicia por `key={id}`.
- **Select dentro de Dialog precisa de `className="z-[60]"` no `SelectContent`** (erro clássico: empate de z-50, menu abre atrás na 1ª vez e "trava").
- Placeholder curto + `truncate` no SelectValue (erro #007).

## 4. Botões e status (padrão aprovado pelo David)

- **Hierarquia de peso visual:** ação principal = sólida compacta; ação destrutiva (Cancelar/Excluir) = **outline** (borda + texto vermelhos, `hover:bg-red-50`), nunca bloco vermelho gigante; ação de tema/início = sólida na **cor do tema** (`bg-primary text-primary-foreground`).
- Ações: texto+ícone sempre, exceto WhatsApp de linha (ícone oficial sozinho, `h-8 w-8`, com `title` + `aria-label` — exceção pedida pelo dono, não propagar).
- Ciclo de status com nomes claros: `Agendado → (Iniciar) → Em andamento → (Concluir) → Completo` + `Cancelado` lateral. Evitar estados sem função na UI (ex.: "Confirmar" foi removido por não gerar valor nem automação).
- Sempre que adicionar/renomear status, atualizar `ACTIVE_STATUSES` em `calendar/constants.ts` E a cópia local em `AppointmentActions.tsx` (duas listas — erro comum de atualizar só uma).
- Cancelar/destrutivo SEMPRE com `ConfirmDeleteDialog` citando o item (regra #006).

## 5. Processo de trabalho que funcionou (replicar)

1. **Auditar a página contra o AGENTS.md** (botões, espaço vazio, responsividade 375px/1440px — ver `docs/qa-visual-checklist.md`).
2. **Apresentar opções antes de decidir:** gerar preview HTML standalone em `docs/` (padrão: frames de celular 360px, primária lilás #8B5CF6, dados realistas, tabela comparativa) — exemplos: `agenda-preview.html`, `agenda-preview-v2.html`, `fila-botoes-preview.html`, `paletas-preview.html`. David responde no formato "Opção X".
3. Implementar → `npm run check && npm run lint && npx vitest run` (baseline 60 testes) → commit.
4. Registrar entregas no `MEMORY.md` (formato `Nome — DD/MM`).

## 6. Estado atual da Agenda (referência)

- Mobile = Fila do dia; desktop = semana/dia (WeekView/DayView).
- Componentes-chave: `appointments/FilaDoDia.tsx`, `appointments/AppointmentActions.tsx`, `appointments/CheckoutDialog.tsx` (check-out gera lançamento financeiro vinculado), `calendar/constants.ts` (status), `home/TodayAppointmentsBoard.tsx`.
- Ciclo completo com dinheiro: Concluir → `financial.create` com `appointmentId` → status `completed`.
