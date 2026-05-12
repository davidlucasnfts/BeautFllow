# RF-003: Agendamentos e Calendário

> **Data:** 12/05/2026 | **Status:** Implementado

---

## User Story

**Como** recepcionista,
**quero** agendar serviços no calendário,
**para que** eu organize a agenda do salão.

---

## Critérios de Aceitação

### Cenário 1: Novo agendamento (Happy Path)
- **Dado** que selecionei cliente, profissional, serviço, data e hora
- **Quando** clico em "Criar"
- **Então** o agendamento aparece no calendário

### Cenário 2: Conflito de horário
- **Dado** que o profissional já tem agendamento às 10:00
- **Quando** tento agendar outro serviço no mesmo horário
- **Então** vejo alerta de conflito (futuro — não implementado no MVP)

### Cenário 3: Check-in
- **Dado** que o cliente chegou ao salão
- **Quando** clico em "Check-in"
- **Então** o status muda para "checked_in"

### Cenário 4: Cancelamento
- **Dado** que o cliente cancelou
- **Quando** clico em "Cancelar"
- **Então** o status muda para "cancelled" e libera o horário

---

## Regras de Negócio

1. Horário de funcionamento: 08:00 às 20:00
2. Duração do agendamento = duração do serviço
3. Status flow: scheduled → confirmed → checked_in → completed
4. Cancelamento gera audit log

---

## Dependências

- RF-001 (Autenticação)
- RF-002 (Clientes)
