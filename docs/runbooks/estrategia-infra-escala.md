# Runbook: Estratégia de Infraestrutura e Escala

> **Data:** 06/09/2026
> **Função:** Referência única sobre custos, gatilhos de upgrade e princípios de backup/escala do StudioFlow
> **Status:** Estratégia em vigor — revisar a cada 10 salões ativos

---

## Resumo Executivo

> **Hoje:** MVP no free tier — Vercel Hobby + Supabase Free = **R$ 0/mês**
> **Maior risco:** Banco de dados (limite de 500MB no free) — cresce com clientes, agendamentos e audit logs
> **Maior risco operacional:** Supabase Free **pausa o projeto após 7 dias sem atividade** — inaceitável para produção com salões pagantes
> **Regra de ouro:** só sair do free tier quando um gatilho objetivo deste documento for atingido, nunca antes

---

## 1. Cenário Atual (Free Tier)

| Componente | Ferramenta | Plano | Limite principal | Custo/mês |
|---|---|---|---|---|
| Frontend + API | Vercel | Hobby | 100 GB bandwidth, functions serverless | R$ 0 |
| Banco + Auth | Supabase | Free | 500 MB banco, 30 conexões | R$ 0 |
| Storage (fotos/docs) | Supabase | Free | 1 GB | R$ 0 |
| **TOTAL** | | | | **R$ 0** |

---

## 2. Gatilhos de Upgrade (ordem de risco)

| # | Componente | Limite Free | Estoura quando | Consequência | Upgrade |
|---|---|---|---|---|---|
| 1 | **Supabase Free — pausa** | 7 dias sem atividade | Qualquer projeto em produção | **Projeto fica offline** | Pro (R$ ~135/mês) |
| 2 | **Supabase Conexões** | 30 simultâneas | ~10-15 usuários ativos | "Too many connections" | Pro (pooler incluso) |
| 3 | **Supabase Banco** | 500 MB | ~40-60 salões ativos (estimativa) | Lentidão → erro | Pro (8 GB) |
| 4 | **Supabase Storage** | 1 GB | Uploads de fotos de clientes/serviços | Uploads falham | Cloudflare R2 (grátis até 10 GB) |
| 5 | **Vercel Functions** | 10 s (Hobby) | Relatórios/exportações grandes | Timeout 500 | Otimizar código (paginação) antes de pagar |
| 6 | **Vercel Bandwidth** | 100 GB/mês | Improvável em B2B pequeno | Deploy congela | Pro (R$ ~100/mês) |

### Estimativa de crescimento do banco

| Perfil de salão | Salões | Agendamentos/mês | Banco estimado | Cabe no Free? |
|---|---|---|---|---|
| **Pequeno** (1 profissional) | 40 | ~300 | ~350-450 MB | ⚠️ No limite |
| **Médio** (3-5 profissionais) | 15 | ~800 | ~400-500 MB | ❌ Não |
| **Grande** (10+ profissionais) | 5 | ~2.000 | ~500 MB+ | ❌ Não |

> **Fórmula aproximada:** cada salão ativo consome ~8-12 MB/mês (clientes, agendamentos, financeiro, audit logs). Revalidar com dados reais a cada fase.

---

## 3. Opções de Banco de Dados

| Opção | Custo | Capacidade | Backup | Melhor para |
|---|---|---|---|---|
| **Supabase Free** | R$ 0 | 500 MB | Manual | MVP / homologação |
| **Supabase Pro** | R$ ~135/mês | 8 GB | Diário automático (7 dias) | Até ~150 salões |
| **Supabase Team** | R$ ~325/mês | 40 GB | Diário (14 dias) | 150-400 salões |
| **Self-hosted (VPS)** | R$ 150-300/mês | Ilimitado | Manual (pg_dump + R2) | 400+ salões, exige DevOps |

### Recomendação por fase

| Fase | Salões ativos | Recomendação | Por quê |
|---|---|---|---|
| MVP | 1-10 | Supabase Free (aceitar pausa manual) | Custo zero |
| Lançamento | 10-50 | **Supabase Pro** | Elimina pausa, backup automático, 8 GB |
| Crescimento | 50-150 | Supabase Pro + otimizações | Índices, arquivamento de logs |
| Escala | 150+ | Team ou self-hosted | Banco > 8 GB |

---

## 4. Princípios de Backup

1. **Migrations são o backup de schema** — toda mudança estrutural passa por `supabase/migrations/NNN-descricao.sql` versionado no Git
2. **`schema_safe.sql` é gerado** juntando as migrations — nunca editar manualmente
3. **Backup de dados (free tier):** pg_dump semanal manual via Supabase Dashboard → guardar arquivo fora do projeto (R2/Drive)
4. **Backup de dados (Pro):** automático diário pela Supabase — apenas verificar retenção
5. **Antes de migration destrutiva** (drop/alter): pg_dump da tabela afetada
6. **Testar restore** ao menos 1x por trimestre (subir dump em banco local e validar)

---

## 5. O que NUNCA fazer em produção

- ❌ **Nunca** desabilitar RLS em tabela com dados pessoais
- ❌ **Nunca** usar `npm run db:push` em produção — só migrations (`db:migrate`)
- ❌ **Nunca** deixar salão pagante em Supabase Free (risco de pausa)
- ❌ **Nunca** retornar 403 para acesso cross-tenant — sempre **404** (ver `docs/requirements/regras-de-negocio.md` RN-002)
- ❌ **Nunca** hardcodear secrets ou usar fallback `|| 'valor'` em env sensível
- ❌ **Nunca** armazenar dados pessoais (nome, telefone) em logs de aplicação
- ❌ **Nunca** fazer delete físico sem audit log registrado
- ❌ **Nunca** subir sem rodar `npm run quality` local (ver `docs/DOD.md`)

---

## 6. Otimizações Obrigatórias (independentes da fase)

| # | Otimização | Ganho | Quando |
|---|---|---|---|
| 1 | Índices em FKs críticas (`salon_id`, `appointment_id`) | 3-5x mais rápido | Antes de 20 salões |
| 2 | Arquivar `audit_logs` > 12 meses em `audit_logs_archive` | 20-30% de banco após 1 ano | Ao atingir 50 salões |
| 3 | Paginação em todas as listagens | Evita timeout Vercel | Sempre |
| 4 | Fotos em storage, nunca em base64 no banco | Banco não explode | Sempre |
| 5 | `select` com colunas específicas (não `*`) em listas | Menos bandwidth | Sempre |

---

## 7. Roteiro de Implementação

### Antes de 10 salões (fase atual)
```
□ Definir limites de uso e monitorar tamanho do banco (Dashboard Supabase)
□ Criar índices faltantes nas FKs
□ Documentar pg_dump manual semanal
□ Revisar este documento
```

### 10-50 salões
```
□ Upgrade Supabase Free → Pro
□ Configurar backup automático (nativo do Pro)
□ Criar tabela audit_logs_archive
□ Avaliar Cloudflare R2 para storage (se fotos > 500 MB)
```

### 50+ salões
```
□ Avaliar Supabase Team vs self-hosted
□ Implementar arquivamento automático de logs
□ Configurar PgBouncer / pooler de conexões
□ Revisar precificação vs custo por salão (ver docs/requirements/proposta-planos-precificacao.md)
```

---

## 8. Decisões Pendentes

| # | Decisão | Recomendação | Status |
|---|---|---|---|
| 1 | Quando subir para Supabase Pro? | No 1º salão pagante (elimina risco de pausa) | ⏳ Aguardando David |
| 2 | Storage de fotos: Supabase ou R2? | R2 quando passar de 500 MB | ⏳ Aguardando David |
| 3 | Política de retenção de audit_logs? | 12 meses ativos + arquivo | ⏳ Aguardando David |

---

> **Próximo passo:** ver `docs/requirements/proposta-planos-precificacao.md` para precificação baseada nesta infraestrutura.
