# Regras de Negócio — StudioFlow

> **Data:** 06/09/2026
> **Função:** Referência única das regras de negócio (RN). Consultar SEMPRE antes de criar/editar funcionalidades.
> **Formato:** RN-NNN — cada regra tem ID, categoria e pseudo-código executável

---

## Glossário

| Termo | Definição |
|-------|-----------|
| **Salão** | Tenant do sistema (salão de beleza, barbearia ou clínica de estética) — isolamento multi-tenant |
| **Owner** | Usuário dono do salão (role `admin`) |
| **Profissional** | Membro da equipe que executa serviços (role `professional`) |
| **Cliente** | Pessoa atendida pelo salão, cadastrada na base |
| **Agendamento** | Reserva de horário de um profissional para um cliente/serviço |
| **Audit Log** | Registro imutável de toda operação sensível (ver RN-003) |

---

## RN-001 — Permissões da Equipe (RBAC)

| Campo | Valor |
|-------|-------|
| ID | RN-001 |
| Categoria | Permissão |

**Regra:**

```
IF role == "admin" (buscado do banco, nunca do cliente)
    PODE: todas as operações do salão, gerenciar equipe, configurações, financeiro
IF role == "professional"
    PODE: visualizar agenda própria, criar/editar agendamentos, registrar atendimento
    NÃO PODE: gerenciar equipe, acessar financeiro, excluir clientes
```

> A role é sempre buscada do banco no contexto da API — nunca confiar em role enviada pelo frontend.

---

## RN-002 — Multi-Tenancy (Isolamento por Salão)

| Campo | Valor |
|-------|-------|
| ID | RN-002 |
| Categoria | Restrição |

**Regra:**

```
TODA query no banco DEVE filtrar por salon_id = ctx.user.salonId
EXCEÇÃO: tabela users (autenticação global)

VIOLAÇÃO: retornar 404 NOT_FOUND — NUNCA 403
    (404 não revela a existência do recurso em outro tenant;
     403 confirma que o recurso existe e incentiva enumeração)
```

---

## RN-003 — Audit Log Obrigatório

| Campo | Valor |
|-------|-------|
| ID | RN-003 |
| Categoria | Automação |

**Regra:**

```
PARA toda operação CREATE, UPDATE, DELETE em dados do negócio:
    REGISTRAR em audit_logs os campos OBRIGATÓRIOS:
        - user_id      (quem fez)
        - salon_id     (tenant — para filtro e arquivamento)
        - action       (create | update | delete)
        - table_name   (tabela afetada)
        - record_id    (id do registro)
        - old_data     (JSONB — obrigatório em update/delete)
        - new_data     (JSONB — obrigatório em create/update)
        - ip_address   (origem da requisição)
        - user_agent   (obrigatório — rastreabilidade LGPD)
        - timestamp    (quando)
```

> Login, logout e exportação de dados também geram audit log.

---

## RN-004 — Ciclo de Vida do Agendamento

| Campo | Valor |
|-------|-------|
| ID | RN-004 |
| Categoria | Restrição + Automação |

**Regra:**

```
Status válidos (ordem lógica):
    agendado → confirmado → em_atendimento → concluído
    agendado/confirmado → cancelado
    agendado/confirmado → faltou (cliente não compareceu)

IF status == "concluído" OU "cancelado" OU "faltou"
    NÃO PODE: voltar a status anterior (criar novo agendamento se necessário)
    PODE: visualizar

CADA mudança de status DEVE gerar audit log (RN-003)
```

---

## RN-005 — Conflito de Horário do Profissional

| Campo | Valor |
|-------|-------|
| ID | RN-005 |
| Categoria | Validação |

**Regra:**

```
AO criar/editar agendamento:
    SE já existe agendamento do MESMO profissional
       com status em (agendado, confirmado, em_atendimento)
       cujo intervalo [início, início + duração] se sobrepõe ao novo
    ENTÃO REJEITAR com erro "Horário indisponível para este profissional"

Agendamentos "cancelado" e "faltou" NÃO bloqueiam horário.
```

---

## RN-006 — Exclusão com Confirmação

| Campo | Valor |
|-------|-------|
| ID | RN-006 |
| Categoria | Restrição (UX) |

**Regra:**

```
TODA exclusão (cliente, serviço, profissional, agendamento, lançamento financeiro):
    DEVE abrir AlertDialog de confirmação CITANDO O NOME DO ITEM
    NUNCA chamar mutation de delete direto no clique do botão
    DEVE gerar audit log (RN-003)
```

---

## RN-007 — Campos Obrigatórios de Cliente

| Campo | Valor |
|-------|-------|
| ID | RN-007 |
| Categoria | Validação |

**Regra:**

```
PARA criar cliente:
    OBRIGATÓRIO: nome, salon_id
    TELEFONE: obrigatório se salão usa confirmação por WhatsApp/SMS
    VALIDAÇÃO: e-mail (se informado) deve ter formato válido
    LGPD: consentimento de dados pessoais registrado antes do 1º uso em campanhas
```

---

## RN-008 — Financeiro: Vínculo com Atendimento

| Campo | Valor |
|-------|-------|
| ID | RN-008 |
| Categoria | Restrição |

**Regra:**

```
Lançamento de receita DEVE referenciar:
    - appointment_id (origem), OU
    - descrição livre justificada (avulso)

Lançamentos de agendamento "concluído" NÃO podem ser editados
    sem gerar audit log com old_data completo (RN-003).

NENHUM lançamento é apagado: cancelamentos usam lançamento de estorno.
```

---

## RNs de Domínio — A Preencher

> Seção reservada para regras específicas que surgirem por módulo
> (comissões, pacotes, assinaturas, fidelidade). Preencher com o mesmo formato RN-NNN.

| ID | Módulo | Regra | Status |
|----|--------|-------|--------|
| | | | |

---

## Tabela de Decisão — Ações por Role

| Ação | Admin | Professional |
|------|:-----:|:------------:|
| Gerenciar equipe (criar/editar/remover) | ✅ | ❌ |
| Configurar salão (horários, serviços) | ✅ | ❌ |
| Criar/editar cliente | ✅ | ✅ |
| Excluir cliente | ✅ | ❌ |
| Criar/editar agendamento | ✅ | ✅ |
| Cancelar agendamento | ✅ | ✅ |
| Registrar conclusão de atendimento | ✅ | ✅ |
| Visualizar financeiro | ✅ | ❌ |
| Criar lançamento financeiro | ✅ | ❌ |
| Exportar dados (CSV/PDF) | ✅ | ❌ |
| Visualizar agenda própria | ✅ | ✅ |
| Enviar campanha/comunicação | ✅ | ❌ |
