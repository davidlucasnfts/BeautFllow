# RF-002: Gestão de Clientes (CRM)

> **Data:** 12/05/2026 | **Status:** Implementado

---

## User Story

**Como** recepcionista,
**quero** cadastrar e gerenciar clientes,
**para que** eu tenha histórico completo de atendimentos.

---

## Critérios de Aceitação

### Cenário 1: Cadastro de cliente (Happy Path)
- **Dado** que estou na tela de clientes
- **Quando** preencho nome, telefone e clico em salvar
- **Então** o cliente é cadastrado e aparece na lista

### Cenário 2: Busca por telefone
- **Dado** que existem 100 clientes cadastrados
- **Quando** digito o telefone no campo de busca
- **Então** vejo apenas os clientes que correspondem

### Cenário 3: LGPD — Anonimização
- **Dado** que um cliente solicitou exclusão de dados
- **Quando** clico em "Anonimizar"
- **Então** os dados pessoais são substituídos por hash

---

## Regras de Negócio

1. Telefone é obrigatório e único por salão
2. CPF opcional, mas validado se informado
3. Segmentação automática: new → active → vip → at_risk → inactive
4. Consentimento LGPD obrigatório para marketing

---

## Dependências

- RF-001 (Autenticação)
