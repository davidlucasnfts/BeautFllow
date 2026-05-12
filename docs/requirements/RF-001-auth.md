# RF-001: Autenticação e Autorização

> **Data:** 12/05/2026 | **Status:** Implementado

---

## User Story

**Como** usuário do BeautyFlow,
**quero** fazer login com email/senha ou OAuth,
**para que** eu acesse meu salão de forma segura.

---

## Critérios de Aceitação

### Cenário 1: Login com email/senha (Happy Path)
- **Dado** que tenho uma conta cadastrada
- **Quando** informo email e senha corretos
- **Então** sou autenticado e redirecionado para o dashboard

### Cenário 2: Login com credenciais inválidas
- **Dado** que informo email ou senha incorretos
- **Quando** submeto o formulário
- **Então** vejo mensagem de erro genérica (não revela qual campo está errado)

### Cenário 3: Acesso não autorizado
- **Dado** que não estou autenticado
- **Quando** tento acessar /dashboard
- **Então** sou redirecionado para /login

---

## Regras de Negócio

1. Senha mínima: 8 caracteres
2. JWT expira em 7 dias
3. Rate limit: 5 tentativas/minuto por IP
4. Role padrão: "user" (OWNER_UNION_ID vira "admin")

---

## Dependências

- Nenhuma
