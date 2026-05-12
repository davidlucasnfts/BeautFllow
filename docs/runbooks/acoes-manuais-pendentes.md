# Runbook: Ações Manuais Pendentes

> **Data:** 12/05/2026 | **Status:** Aguardando execução
>
> Este runbook contém TODAS as ações manuais que precisam ser feitas fora do Kimi Code.
> Execute uma por vez e marque como [x] no SESSION-CONTEXT.md.

---

## 1. Configurar VERCEL_TOKEN no GitHub Secrets

### Por que?
O CI/CD precisa de um token da Vercel para fazer deploy automático quando houver push na branch `main`.

### Passo a passo

**1.1 Gerar token na Vercel**
1. Acesse: https://vercel.com/dashboard
2. Clique no seu **avatar** (canto superior direito)
3. No dropdown, clique em **Account Settings**
4. Menu lateral esquerdo → procure por **Tokens** (pode estar em "Developer" ou "Settings")
   - Se não achar: tente direto https://vercel.com/account/tokens
5. Clique em **Create Token**
6. Preencha:
   - **Name:** `GitHub Actions Deploy`
   - **Scope:** Selecione o projeto `beautyflow` (ou `Full Account` se não aparecer)
   - **Expiration:** `No expiration` (ou data futura)
7. Clique em **Create Token**
8. **Copie o token** (só aparece uma vez!)

**1.2 Adicionar no GitHub**
1. Acesse: https://github.com/DavidLucas\*/beautyflow/settings/secrets/actions
   - (substitua `DavidLucas*` pelo seu usuário/nome do repo)
2. Clique em **New repository secret**
3. Preencha:
   - **Name:** `VERCEL_TOKEN`
   - **Secret:** cole o token copiado da Vercel
4. Clique em **Add secret**

**1.3 Verificar**
- O secret deve aparecer na lista como `VERCEL_TOKEN`

---

## 2. Configurar Variáveis de Ambiente no Vercel

### Por que?
O deploy na Vercel precisa saber a URL do banco, secrets do app, etc.

### Passo a passo

**2.1 Acessar projeto na Vercel**
1. Acesse: https://vercel.com/dashboard
2. Clique no projeto **beautyflow**
3. Menu superior → **Settings** → **Environment Variables**

**2.2 Adicionar variáveis**

| Variável | Valor | Ambiente |
|----------|-------|----------|
| `DATABASE_URL` | `postgresql://postgres.ssoanpjztepusxcnffjh:...` | Production, Preview |
| `APP_SECRET` | Gere uma string aleatória de 32+ caracteres | Production, Preview |
| `APP_ID` | `beautyflow` | Production, Preview |
| `OWNER_UNION_ID` | `admin@beautyflow.com` | Production, Preview |

**2.3 Gerar APP_SECRET seguro**
- Abra o terminal/PowerShell e rode:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
- Copie o resultado e use como `APP_SECRET`

**2.4 Salvar**
- Clique em **Save** para cada variável

---

## 3. Verificar RLS no Supabase

### Por que?
A migration 002 habilitou RLS, mas precisa confirmar que está ativo.

### Passo a passo

**3.1 Acessar Supabase**
1. Acesse: https://app.supabase.com
2. Clique no projeto **beautyflow**
3. Menu lateral → **Table Editor**

**3.2 Verificar RLS**
1. Clique na tabela **clients**
2. Aba superior → **Auth Policies**
3. Deve aparecer: `tenant_isolation_clients` na lista
4. Repita para: `services`, `professionals`, `appointments`, `communications`, `financial_records`, `consent_forms`, `consent_signatures`, `salon_users`

**3.3 Se não aparecer**
- Vá para **SQL Editor** (menu lateral)
- Cole o conteúdo de `supabase/migrations/002-rls-policies.sql`
- Clique em **Run**

---

## 4. Configurar Sentry (Error Tracking) — Opcional

### Por que?
Sentry captura erros em produção e avisa em tempo real.

### Passo a passo

**4.1 Criar conta**
1. Acesse: https://sentry.io/signup/
2. Crie conta (gratuito para 1 projeto, 5k erros/mês)
3. Crie projeto → **React**

**4.2 Obter DSN**
1. No projeto Sentry → **Settings** → **Client Keys (DSN)**
2. Copie o DSN (ex: `https://xxx@yyy.ingest.sentry.io/zzz`)

**4.3 Adicionar ao projeto**
- Adicionar como variável no Vercel:
  - **Name:** `SENTRY_DSN`
  - **Value:** cole o DSN
  - **Ambiente:** Production

**4.4 Instalar no código**
- Isso o Kimi faz depois, quando você pedir.

---

## Checklist Final

Após executar as ações acima:

```
□ VERCEL_TOKEN configurado no GitHub Secrets
□ Variáveis de ambiente configuradas na Vercel
□ RLS verificado no Supabase
□ Sentry configurado (opcional)
```

Atualize o `SESSION-CONTEXT.md` marcando como [x] as concluídas.
