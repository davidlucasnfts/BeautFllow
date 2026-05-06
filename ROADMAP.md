# BeautyFlow — Roadmap

Ultima atualizacao: 05/05/2026

---

## Registro de Alteracoes

### 05/05/2026 — Setup Inicial no Kimi Code
- [dev] Projeto migrado do Kimi Web para Kimi Code
- [dev] Skill extraida e analisada
- [doc] AGENTS.md criado com contexto do projeto
- [dev] Estrutura simplificada (pastas duplicadas removidas)
- [dev] Dependencias instaladas (658 pacotes)
- [dev] Type-check validado (sem erros)
- [dev] Servidor de dev testado (localhost:3000)
- [doc] ROADMAP.md criado
- [ref] AGENTS.md e ROADMAP.md reorganizados (sem duplicacao)
- [doc] MEMORY.md criado como ponto de entrada unico para sessoes
- [doc] Regra de leitura unica salva no AGENTS.md

### 05/05/2026 — Identidade Visual (Fase 1)
- [ok] Paleta de cores aplicada: rosa `#E8A0BF` (primary) / dourado `#D4AF37` (secondary/accent) / fundo `#FAFAFA` (background)
- [ok] Fonte Playfair Display adicionada para titulos (serif)
- [ok] Fonte Inter adicionada para corpo (sans)
- [ok] Tema dark ajustado com variacoes da paleta beauty
- [ok] CSS variables atualizadas em `src/index.css`
- [ok] Tailwind config atualizado com fontFamily sans/serif
- [ok] Logo SVG inline adicionado ao sidebar
- [ok] Logo SVG inline adicionado a landing page (navbar)
- [ok] Cores hardcoded da landing page trocadas por CSS variables
- [ok] Titulos com font-serif (Playfair Display) aplicados
- [fix] Textos em ingles na pagina de Login traduzidos para portugues ("Welcome" → "Bem-vindo", "Sign in with Kimi" → "Entrar com Kimi")
- [ok] Verificacao completa: todas as paginas do sistema estao em portugues

### 05/05/2026 — Dashboard Rico (Fase 2)
- [ok] Backend: getDashboardMetrics expandido com comparacao mes anterior, proximos agendamentos, atividades recentes, consentimentos pendentes, receita e crescimento
- [ok] Cards com sparklines (mini graficos SVG) em todos os KPIs
- [ok] Alertas visuais: banner amarelo para consentimentos LGPD pendentes, banner vermelho para taxa no-show acima de 15%
- [ok] KPIs com comparacao periodo anterior (setas de tendencia e percentuais)
- [ok] Widget de proximos agendamentos com data, hora, cliente, servico e profissional
- [ok] Timeline de atividades recentes com icones de status e datas
- [ok] Componente KpiCard reutilizavel com suporte a sparklines e tendencias
- [ok] Titulos com font-serif (Playfair Display) aplicados no dashboard

### 06/05/2026 — Migracao MySQL para PostgreSQL/Supabase
- [ref] Schema completo reescrito: mysqlTable → pgTable, mysqlEnum → pgEnum declarados separadamente
- [ref] Conexao do banco: mysql2 → postgres-js (driver PostgreSQL)
- [ref] drizzle.config.ts: dialect mysql → postgresql
- [ref] Queries: $returningId() → returning(), onDuplicateKeyUpdate → onConflictDoUpdate
- [ref] Queries: DATE_FORMAT → TO_CHAR com formato 'YYYY-MM'
- [ref] Routers: correcao de tipos Date → string para colunas date do PostgreSQL
- [ref] Removido campo 'price' de appointments (nao existia no schema)
- [ref] Removido campo 'isPaid'/'paidAt' de financial_records (nao existia no schema)
- [ref] Corrigido relations.ts: colunas inexistentes removidas
- [fix] Corrigido Consent.tsx: 'version' → data de criacao do formulario

---

## Diretrizes de UX/UI

Aplicaveis a todas as fases.

**Espaco e Layout:**
- Zero espacos vazios sem funcao
- Paddings proporcionais (`py-10` a `py-14`, nunca `py-20/py-28` sem necessidade)
- Hero compacto (altura pelo conteudo, nao pela tela)
- Conteudo acima do fold (valor em 3 segundos, sem rolar)

**Conversao e Copywriting:**
- Headline na dor (ex: "Nunca mais perca um agendamento")
- Antes vs Depois (transformacao real, nao lista de features)
- Depoimentos com numeros concretos ("30% menos faltas")
- CTA claro e repetido (hero, meio, final)
- Prova social no hero (numeros, avatares, cargos)

**Visual e Componentes:**
- Cores distintas por card
- Placeholder visual quando nao ha imagem
- Botoes sempre visiveis (nunca branco sobre branco)
- Transicoes suaves (header ao rolar, hover em cards)

**Mobile-First:**
- Touch targets minimos de 44px
- Stack vertical em mobile (texto acima, imagem abaixo)
- Menu hamburguer em telas pequenas
- Fontes: min 16px inputs, 14px texto corrido

---

## Fases do Projeto

Status: [X] Concluido | [~] Em andamento | [ ] Pendente | [-] Pausado | [!] Cancelado

### Fase 1: Identidade Visual — ✅ CONCLUIDA (05/05)
Todas as tarefas entregues. Ver Registro de Alteracoes para detalhes.

### Fase 2: Dashboard Rico — ✅ CONCLUIDA (05/05)
Ver Registro de Alteracoes para detalhes.

### Fase 3: Migracao para Supabase — [~] EM ANDAMENTO (06/05)
| # | Tarefa | Status | Data |
|---|--------|--------|------|
| 3.1 | Schema PostgreSQL | [X] | 06/05 |
| 3.2 | Driver e conexao | [X] | 06/05 |
| 3.3 | Queries atualizadas | [X] | 06/05 |
| 3.4 | Criar projeto Supabase | [ ] | — |
| 3.5 | Configurar DATABASE_URL | [ ] | — |
| 3.6 | Rodar db:push no Supabase | [ ] | — |
| 3.7 | Configurar RLS (Row Level Security) | [ ] | — |

### Fase 3: Calendario Profissional
| # | Tarefa | Status | Data |
|---|--------|--------|------|
| 3.1 | View diaria com timeline horizontal | [ ] | — |
| 3.2 | Cores dos servicos nos eventos | [ ] | — |
| 3.3 | Preview do profissional no evento | [ ] | — |
| 3.4 | Drag-and-drop para reagendamento | [ ] | — |
| 3.5 | Filtros por profissional/servico | [ ] | — |

### Fase 4: Landing Page que Vende
| # | Tarefa | Status | Data |
|---|--------|--------|------|
| 4.1 | Imagens por IA | [ ] | — |
| 4.2 | Depoimentos com avatares | [ ] | — |
| 4.3 | Mockups do app | [ ] | — |
| 4.4 | Otimizar copy e CTAs | [ ] | — |
| 4.5 | SEO basico (meta tags, schema.org) | [ ] | — |

### Fase 5: Integracoes
| # | Tarefa | Status | Data |
|---|--------|--------|------|
| 5.1 | WhatsApp Business API (360dialog) | [ ] | — |
| 5.2 | Exportacao PDF de relatorios | [ ] | — |
| 5.3 | Notificacoes push | [ ] | — |
| 5.4 | Webhooks para agendamentos | [ ] | — |

### Fase 6: Relatorios e Analytics
| # | Tarefa | Status | Data |
|---|--------|--------|------|
| 6.1 | Faturamento por periodo | [ ] | — |
| 6.2 | Ocupacao dos profissionais | [ ] | — |
| 6.3 | Servicos mais vendidos | [ ] | — |
| 6.4 | Graficos de desempenho (recharts) | [ ] | — |
| 6.5 | Export CSV/Excel | [ ] | — |

### Fase 7: Micro-interacoes e UX
| # | Tarefa | Status | Data |
|---|--------|--------|------|
| 7.1 | Toasts customizados (Sonner) | [ ] | — |
| 7.2 | Loaders e estados de loading | [ ] | — |
| 7.3 | Hover effects e transicoes | [ ] | — |
| 7.4 | Animacoes de entrada nas paginas | [ ] | — |
| 7.5 | Feedback visual em formularios | [ ] | — |

### Fase 8: Seguranca e Compliance
| # | Tarefa | Status | Data |
|---|--------|--------|------|
| 8.1 | Revisao LGPD | [ ] | — |
| 8.2 | Logs de auditoria (audit_logs) | [ ] | — |
| 8.3 | Rate limiting em endpoints sensiveis | [ ] | — |
| 8.4 | Backup automatico do banco | [ ] | — |

---

## Tarefas Avulsas (sem fase definida)

| # | Tarefa | Status | Data |
|---|--------|--------|------|
| A.1 | Revisar consistencia visual dos componentes shadcn/ui | [ ] | — |

---

## Como Registrar Alteracoes

Adicionar entrada no Registro de Alteracoes:

```
### DD/MM/YYYY — Titulo
- [tipo] Descricao
```

Tipos: `[feat]` Nova feature | `[fix]` Bugfix | `[ok]` Concluido/Entregue | `[perf]` Performance | `[sec]` Seguranca | `[doc]` Documentacao | `[ref]` Refatoracao | `[dev]` Configuracao/DevOps

---

## Regras de Manutencao deste Arquivo

1. **Nunca duplicar informacao** entre Registro de Alteracoes e Fases do Projeto
2. **Fase concluida:** substituir tabela inteira por "✅ CONCLUIDA (data). Ver Registro de Alteracoes para detalhes."
3. **Tarefa concluida:** marcar com [X] e data, mas nao repetir descricao no Registro
4. **Tarefa avulsa:** se nao pertence a nenhuma fase, adicionar em "Tarefas Avulsas"
5. **Sempre atualizar** a ultima data no topo do arquivo
