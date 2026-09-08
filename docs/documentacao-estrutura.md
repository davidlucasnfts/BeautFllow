# StudioFlow — Estrutura de Documentação

> **Data:** 12/05/2026
> **Regra:** Antes de criar/modificar qualquer arquivo de documentação, consultar este arquivo.

---

## Mapa de Arquivos

| Arquivo | Função | Quem atualiza | Quando atualizar |
|---------|--------|---------------|------------------|
| `AGENTS.md` | Regras de codificação do projeto | Kimi | Nova regra técnica |
| `MEMORY.md` | Histórico de funcionalidades entregues | Kimi | Feature concluída |
| `SESSION-CONTEXT.md` | Estado atual da sessão | Kimi | A cada sessão |
| `ROADMAP.md` | Planejamento e fases do projeto | Kimi | Mudança de escopo |
| `MestreProjects.md` | Padrões para TODOS os projetos | Kimi | Apenas quando David pedir "para todos" |
| `docs/adr/ADR-NNN-*.md` | Decisões arquiteturais | Kimi | Decisão significativa |
| `docs/runbooks/*.md` | Procedimentos operacionais | Kimi | Novo procedimento |
| `docs/runbooks/estrategia-infra-escala.md` | Custos, gatilhos de upgrade e backup | Kimi | Mudança de fase/infra |
| `docs/requirements/RF-NNN.md` | Requisitos funcionais | Kimi | Novo requisito |
| `docs/requirements/regras-de-negocio.md` | Regras de negócio (RN-NNN) | Kimi | Nova regra de negócio |
| `docs/requirements/proposta-planos-precificacao.md` | Proposta de planos/preços (status: proposta) | Kimi | Decisão de precificação |
| `docs/qa-visual-checklist.md` | Checklist de QA visual (375px/1440px) | Kimi | Novo padrão de verificação |
| `docs/ui-improvements-playbook.md` | Padrões de UI aprovados por página (base: Agenda) | Kimi | Antes de melhorar qualquer tela |
| `docs/DOR.md` | Definition of Ready | Kimi | Mudança no processo |
| `docs/DOD.md` | Definition of Done | Kimi | Mudança no processo |
| `docs/LGPD.md` | Compliance LGPD | Kimi | Mudança legal |
| `docs/documentacao-estrutura.md` | Este arquivo | Kimi | Nova categoria de doc |

---

## Regras Anti-Duplicação

- **NUNCA** duplicar informação entre `MEMORY.md` e `SESSION-CONTEXT.md`
- **NUNCA** duplicar regras de segurança entre `AGENTS.md` e `docs/adr/`
- **NUNCA** salvar no `MestreProjects.md` sem explicitamente ser "para todos os projetos"
- **SEMPRE** preferir expandir arquivo existente a criar novo

---

## Checklist antes de criar novo arquivo

```
□ Já existe arquivo com essa função? (ver tabela acima)
□ Se sim, expandir o existente em vez de criar novo
□ Se não, qual é a função única deste arquivo?
□ Adicionar neste mapa após criar
```
