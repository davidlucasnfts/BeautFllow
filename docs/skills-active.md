# Skills Ativas — BeautyFlow

> Arquivo de referência das skills em uso no projeto. Atualizado automaticamente quando uma skill é aplicada.

---

## Status Geral

| Skill | Status | Última Aplicação | Próxima Revisão |
|-------|--------|------------------|-----------------|
| Security | ✅ Ativa | 07/05/2026 (boot.ts headers, audit logs) | Antes do deploy |
| Scalability | ✅ Ativa | 07/05/2026 (PostgreSQL, multi-tenancy) | Quando >100 usuários |
| Cost Reducer | ✅ Ativa | 07/05/2026 (componentes reutilizáveis) | Antes de escalar infra |
| Self-Healing | ✅ Ativa | — (aguardando padrão recorrente) | Quando padrão detectado |

---

## Security — Aplicações no Projeto

### Já implementado
- [x] CORS restrito (`boot.ts`)
- [x] secureHeaders (`boot.ts`) — CSP, X-Frame-Options, nosniff, referrer
- [x] Audit logs em todos os routers críticos
- [x] authedQuery + filtro por salonId
- [x] OAuth 2.0 com JWT
- [x] Rate limiting em memória (`api/lib/rate-limit.ts`)
- [x] Sanitização de input (`api/lib/security-utils.ts`)
- [x] bodyLimit 50MB no Hono

### Pendente (pré-deploy)
- [ ] Aplicar rate limiting nos routers (substituir publicQuery → publicQueryLimited)
- [ ] HSTS header (só em produção com HTTPS)
- [ ] Validação de state parameter no OAuth
- [ ] Dependências auditadas (`npm audit fix`)
- [ ] SameSite=Strict nos cookies de sessão

### Checklist Security (pré-deploy)
```
□ Todos inputs validados e sanitizados
□ Autenticação verificada em rotas protegidas
□ HTTPS forçado
□ Headers de segurança configurados
□ Logs não contêm dados sensíveis
□ Rate limiting ativo
□ Dependências auditadas
```

---

## Scalability — Aplicações no Projeto

### Já implementado
- [x] Stateless (serverless Vercel)
- [x] Multi-tenancy por salonId (shard natural)
- [x] PostgreSQL (escala melhor que MySQL)
- [x] Queries isoladas em `api/queries/salon.ts`

### Pendente (quando crescer)
- [ ] Connection pooling (PgBouncer)
- [ ] Read replicas para relatórios
- [ ] Cache em Redis (sessões, dados frequentes)
- [ ] Paginação em todos os endpoints de listagem
- [ ] Compressão gzip/brotli nas respostas
- [ ] Particionamento de audit_logs por data

### Métricas de gatilho
| Métrica | Limite | Ação |
|---------|--------|------|
| CPU Vercel > 80% | Sustentado | Verificar function duration |
| Query > 100ms | 5+ por minuto | Adicionar índice |
| Conexões Postgres > 80 | Sustentado | PgBouncer |
| Storage Supabase > 80% | — | Limpar logs antigos |

---

## Cost Reducer — Aplicações no Projeto

### Já implementado
- [x] Componentes reutilizáveis (menos tokens futuros)
- [x] Leitura única (economia de contexto)
- [x] Limite 400 linhas/arquivo (manutenção rápida)
- [x] PostgreSQL no Supabase (free tier generoso)

### Estimativa de custo mensal (projeção)

| Serviço | Tier | Custo/mês |
|---------|------|-----------|
| Vercel | Hobby (free) | R$ 0 |
| Supabase | Free tier | R$ 0 |
| Supabase | Pro (quando crescer) | ~R$ 125 |
| Vercel | Pro (quando crescer) | ~R$ 140 |
| **Total inicial** | | **R$ 0** |
| **Total escalado** | | **~R$ 265** |

### Otimizações pendentes
- [ ] CDN para assets estáticos (Vercel já faz)
- [ ] Cache de queries frequentes (reduzir reads do Supabase)
- [ ] Lifecycle policy em storage (quando houver uploads)
- [ ] Auto-suspender banco em horários vazios (se possível)

---

## Self-Healing — Status

### Padrões detectados (aguardando recorrência)

| Padrão | Ocorrências | Vale skill? |
|--------|-------------|-------------|
| Type-check quebrando após refatoração | 1 | Aguardando 2ª |
| Query Drizzle com tipo errado | 1 | Aguardando 2ª |
| Lint falhando em import não usado | 1 | Aguardando 2ª |

### Quando criar skill automática
- Mesmo problema aparecer 2+ vezes
- Solução envolve >3 passos não óbvios
- Outros devs provavelmente enfrentarão o mesmo

---

## Como Usar Este Arquivo

1. **Eu (Kimi)** atualizo este arquivo sempre que aplicar uma skill
2. **Você (David)** verifica aqui antes de cada sessão para saber o estado das skills
3. **Pré-deploy:** executar checklists de Security e Cost Reducer
4. **Pós-deploy:** monitorar métricas de Scalability

---

> Última atualização: 07/05/2026
