# Checklist de QA Visual — StudioFlow

> **Data:** 06/09/2026
> **Função:** Verificação visual obrigatória de toda tela nova ou refatorada antes de entrega (ver item no `docs/DOD.md`)
> **Como usar:** rode `npm run dev`, abra cada página nas larguras **375px** (DevTools → device toolbar → iPhone SE) e **1440px**. Marque ✅ ok, ❌ bug, ⚠️ atenção. Bugs vão para a tabela no final.

---

## 1. Checklist por Padrão de Componente (vale para TODA página)

### Layout e quebras
- [ ] Sem scroll horizontal em 375px (nada transborda a viewport)
- [ ] Grids responsivos: `grid-cols-2 lg:grid-cols-4` (stats), `sm:grid-cols-2 lg:grid-cols-3` (cards)
- [ ] Header de página empilha no mobile (`flex-col sm:flex-row`)
- [ ] Títulos escalam (`text-xl sm:text-2xl`), subtítulos (`text-xs sm:text-sm`)
- [ ] Espaçamento consistente: `space-y-4 lg:space-y-6`, `p-4 lg:p-6`
- [ ] Botões lado a lado usam `flex-wrap` quando necessário

### Texto e overflow
- [ ] Texto longo sem espaços (telefones, URLs): `break-all`, nunca `break-words`
- [ ] Placeholders de Select são curtos e `SelectValue` tem `truncate`
- [ ] Nenhum badge, botão ou select quebra em 2 linhas por texto
- [ ] Nomes longos de cliente/serviço truncam com `truncate` ou `break-all`

### Padrões do projeto (anti-regressão)
- [ ] Cards do mesmo grid com `h-full` (alturas iguais)
- [ ] Cards de listagem com `gap-1.5 py-2.5` no Card (não o default `py-6 gap-6`) + header `p-4`
- [ ] Zero espaço vazio sem função
- [ ] Ações em botões visíveis (texto + ícone) — **sem dropdown de 3 pontinhos**, sem `opacity-0 group-hover`
- [ ] Cores de ação corretas: editar azul-50, excluir red-50, confirmar green-50, ver slate-50
- [ ] Tabelas: coluna de ações na 1ª posição, hover `bg-blue-50/50`, clique na linha abre preview
- [ ] Exclusão abre AlertDialog citando o nome do item (nunca delete direto no clique)
- [ ] Preview/detalhes: círculo `w-14 h-14` com ícone, ações empilhadas, grid `grid-cols-2 lg:grid-cols-3`, labels em `slate-400` uppercase
- [ ] Abas "Todos" mostram tudo; badge com contador quando há pendentes

### Estados
- [ ] **Vazio:** mensagem amigável + ação principal (ex: "Nenhum cliente ainda — cadastre o primeiro")
- [ ] **Loading:** skeleton ou spinner — nunca tela em branco
- [ ] **Erro:** mensagem legível com retry — nunca tela branca nem erro de console cru
- [ ] **Toast** de sucesso/erro aparece após toda mutation

### Formulários
- [ ] Máscaras BR aplicadas: telefone `maskPhoneBR`, data `maskDateBR` (nunca `type="date"`), dinheiro `maskMoneyBR`
- [ ] Campos numéricos com limite de dígitos (`onlyDigits` + slice) — nunca `type="number"` solto
- [ ] Touch targets ≥ 44px, inputs com fonte ≥ 16px
- [ ] Dialog: `w-full max-w-lg max-h-[80vh] overflow-y-auto` — não vaza a tela no mobile
- [ ] Botão Salvar desabilitado enquanto envia; Cancelar é `variant="outline"`

### Acessibilidade e contraste
- [ ] Texto `slate-500` só em secundário — corpo principal mínimo `slate-700`/`800`
- [ ] Ícones acompanhados de texto ou `aria-label`
- [ ] Contraste de badges de status legível (ativo=verde, pendente=âmbar, inativo=cinza)

### Console e performance
- [ ] Zero erros/warnings no console (F12) nas duas larguras
- [ ] Imagens com dimensão ou lazy loading quando aplicável

---

## 2. Checklist por Página

### Dashboard
- [ ] Stats cards aparecem com dados reais
- [ ] Gráficos renderizam sem erro e com cores do design system
- [ ] Filtros de período atualizam os dados

### Agenda / Agendamentos
- [ ] Calendário renderiza o mês atual com agendamentos
- [ ] Conflito de horário bloqueado com mensagem clara
- [ ] Criar/editar/cancelar agendamento atualiza a lista (invalidate)
- [ ] Preview do agendamento mostra profissional, serviço, cliente e status

### Clientes
- [ ] Busca e abas (Todos/Ativos/Inativos) filtram corretamente
- [ ] Máscara de telefone e validação de e-mail funcionam
- [ ] Excluir cliente pede confirmação com o nome

### Serviços
- [ ] Preço com máscara de dinheiro (limite de dígitos)
- [ ] Duração numérica com limite
- [ ] Cards do grid com alturas iguais

### Profissionais
- [ ] Lista com cargo e status
- [ ] Não há dropdown de 3 pontinhos

### Financeiro
- [ ] Lançamentos vinculados a atendimento quando aplicável
- [ ] Exportar CSV/PDF funciona e gera audit log
- [ ] Valores formatados em BRL

### Comunicação
- [ ] Envio de campanha atualiza status dos envios
- [ ] Preview mostra status individual

### Configurações
- [ ] Formulários salvam e mostram toast de sucesso
- [ ] Upload de logo/avatar (se aplicável)

---

## 3. Resumo da Verificação

| Página | 375px | 1440px | Aprovada? |
|--------|:-----:|:------:|-----------|
| Dashboard | | | Sim / Não |
| Agenda | | | Sim / Não |
| Clientes | | | Sim / Não |
| Serviços | | | Sim / Não |
| Profissionais | | | Sim / Não |
| Financeiro | | | Sim / Não |
| Comunicação | | | Sim / Não |
| Configurações | | | Sim / Não |
| *(nova página)* | | | Sim / Não |

---

## 4. Bugs Encontrados

| Página | Largura | Descrição | Console / Erro | Severidade (alta/média/baixa) |
|--------|---------|-----------|----------------|-------------------------------|
| | | | | |
