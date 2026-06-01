# Estrutura de Documentação — BeautyFlow

> Mapa de todos os arquivos de documentação do projeto e suas funções.  
> **Regra:** nunca duplicar informação entre arquivos.

---

## Arquivos na Raiz

| Arquivo | Função | Quando atualizar |
|---------|--------|------------------|
| `README.md` | Introdução rápida do projeto para novos devs | Mudanças na stack ou setup |
| `AGENTS.md` | Regras de código, convenções e preferências do Kimi | Novas regras ou correções de padrão |
| `MEMORY.md` | Funcionalidades entregues e marcos do projeto | Quando uma funcionalidade é concluída |
| `SESSION-CONTEXT.md` | Estado da sessão atual e decisões pendentes | A cada sessão de trabalho |
| `PROPOSTA.md` | Documento de proposta comercial para clientes | Antes de enviar a uma cliente |
| `info.md` | Informações gerais do projeto | Dados gerais |

## Diretórios de Documentação

| Diretório | Conteúdo |
|-----------|----------|
| `docs/adr/` | Architecture Decision Records |
| `docs/requirements/` | Requisitos funcionais (PRD, RF-NNN) |
| `docs/runbooks/` | Procedimentos operacionais |
| `docs/` | Estrutura e governança da documentação |

## Arquivos de Código-Fonte (referência)

| Caminho | Função |
|---------|--------|
| `src/pages/Proposal.tsx` | Página de proposta comercial (`/proposta`) |
| `src/App.tsx` | Registro de rotas da aplicação |
| `api/*-router.ts` | Endpoints tRPC do backend |
| `db/schema.ts` | Schema do banco Drizzle |

---

## Checklist para Nova Documentação

- [ ] Verificar se já existe arquivo com a mesma função
- [ ] Escolher arquivo correto (ver tabela de onde salvar no `AGENTS.md`)
- [ ] Atualizar este arquivo (`documentacao-estrutura.md`) se criar arquivo novo
- [ ] Nunca duplicar informação entre arquivos
