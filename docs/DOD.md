# BeautyFlow — Definition of Done (DoD)

> Checklist: uma tarefa so e considerada concluida quando todos os itens abaixo estao marcados.

---

## Checklist

- [ ] Codigo implementado e funcionando localmente
- [ ] Type-check passando (`npm run check`)
- [ ] Lint passando (`npm run lint`)
- [ ] Testes unitarios cobrindo a logica de negocio (minimo 60% no modulo)
- [ ] Testes manuais realizados (caminho feliz + erro)
- [ ] Multi-tenancy validado (dados isolados por salonId)
- [ ] Nenhum secret hardcoded
- [ ] Codigo revisado (por Kimi Code ou peer review)
- [ ] ROADMAP.md atualizado com data de entrega
- [ ] AGENTS.md atualizado se regras mudaram
- [ ] Sem erros no console do navegador
- [ ] Responsivo em mobile (minimo 375px)

---

## Regras Especificas por Tipo de Tarefa

### Nova Funcionalidade (Feature)
- [ ] Router tRPC criado/registrado
- [ ] Pagina/componente React criado/registrado
- [ ] Schema Drizzle atualizado (se necessario)
- [ ] `db:push` executado com sucesso

### Bugfix
- [ ] Causa raiz identificada e documentada no commit
- [ ] Regressao testada (nao quebrou outras areas)

### Refatoracao
- [ ] Comportamento externo inalterado
- [ ] Performance igual ou melhor
- [ ] Testes existentes continuam passando

### Documentacao
- [ ] Informacao nao duplicada em outros arquivos
- [ ] Links cruzados atualizados
