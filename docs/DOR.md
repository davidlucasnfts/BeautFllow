# BeautyFlow — Definition of Ready (DoR)

> Checklist: uma tarefa so entra em desenvolvimento quando todos os itens abaixo estao marcados.

---

## Checklist

- [ ] Requisito claro e compreensivel (qual problema resolve?)
- [ ] Critérios de aceite definidos (minimo 2: caminho feliz + erro)
- [ ] Dependencias identificadas e resolvidas (outras tarefas, APIs, design)
- [ ] Estimativa em story points definida (ou tamanho: P/M/G)
- [ ] Cabe em um sprint (nao excede o tempo disponivel)
- [ ] Mockups/wireframes disponiveis (se houver UI)
- [ ] Regras de negocio documentadas (se aplicavel)
- [ ] Impacto em outros modulos avaliado

---

## Formatos Obrigatorios

### User Story
```
Como [papel],
quero [acao],
para que [beneficio].
```

### Critérios de Aceite (Gherkin)
```gherkin
Cenario: [descricao do caminho feliz]
  Dado [contexto]
  Quando [acao]
  Entao [resultado verificavel]

Cenario: [descricao do erro]
  Dado [contexto]
  Quando [acao invalida]
  Entao [mensagem de erro / comportamento esperado]
```

---

## Tamanhos de Tarefa

| Tamanho | Descricao | Exemplo |
|---------|-----------|---------|
| P (Pequena) | 1-2 horas | Ajuste de cor, texto, label |
| M (Media) | 1/2 dia | Novo campo em formulario, filtro simples |
| G (Grande) | 1-2 dias | Nova pagina, integracao com API externa |
| GG (Muito Grande) | 3+ dias | Quebrar em tarefas menores |
