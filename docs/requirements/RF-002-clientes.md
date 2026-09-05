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
2. Segmentação automática: new → active → vip → at_risk → inactive
3. Consentimento LGPD obrigatório para marketing

> **Nota (05/09/2026):** CPF e e-mail foram removidos do cadastro de cliente (migration 006).
> CPF é dado sensível sem finalidade no sistema e e-mail não é usado no contato
> (canal principal é WhatsApp no telefone cadastrado).

---

## Dependências

- RF-001 (Autenticação)
