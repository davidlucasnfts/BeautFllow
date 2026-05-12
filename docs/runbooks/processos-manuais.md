# Runbook: Processos Manuais — BeautyFlow

> **Data:** 12/05/2026 | **Status:** Ativo
>
> Este runbook contém TODOS os processos que precisam ser feitos manualmente (fora do Kimi Code).
> Sempre que uma nova ação manual for identificada, adicionar aqui e no `SESSION-CONTEXT.md`.

---

## Índice

1. [Configurar VERCEL_TOKEN no GitHub](#1-configurar-vercel_token-no-github)
2. [Configurar Variáveis de Ambiente na Vercel](#2-configurar-variáveis-de-ambiente-na-vercel)
3. [Rodar Migration no Supabase](#3-rodar-migration-no-supabase)
4. [Verificar RLS no Supabase](#4-verificar-rls-no-supabase)
5. [Configurar Sentry](#5-configurar-sentry)
6. [Trocar Senha do Banco Supabase](#6-trocar-senha-do-banco-supabase)
7. [Adicionar Domínio na Whitelist CORS](#7-adicionar-domínio-na-whitelist-cors)

---

## 1. Configurar VERCEL_TOKEN no GitHub

### Quando fazer?
- Uma única vez, ao configurar CI/CD
- Status: ✅ **Concluído em 12/05/2026**

### Passo a passo

**1.1 Gerar token na Vercel**
1. Acesse: https://vercel.com/account/tokens
2. Clique em **Create Token**
3. Preencha:
   - **Name:** `GitHub Actions Deploy`
   - **Scope:** `Full Account` (ou projeto `beautyflow` se aparecer)
   - **Expiration:** `Never expires`
4. Clique em **Create Token**
5. **Copie o token** (só aparece uma vez!)

**1.2 Adicionar no GitHub**
1. Acesse: https://github.com/davidlucasnfis/beautyflow/settings/secrets/actions
2. Clique em **New repository secret**
3. Preencha:
   - **Name:** `VERCEL_TOKEN`
   - **Secret:** cole o token copiado
4. Clique em **Add secret**

**1.3 Verificar**
- O secret deve aparecer na lista como `VERCEL_TOKEN`

---

## 2. Configurar Variáveis de Ambiente na Vercel

### Quando fazer?
- Uma única vez, ao configurar deploy
- Ou quando adicionar nova variável de ambiente

### Passo a passo

**2.1 Acessar projeto na Vercel**
1. Acesse: https://vercel.com/dashboard
2. Clique no projeto **beautyflow**
3. Menu superior → **Settings** → **Environment Variables**

**2.2 Adicionar variáveis obrigatórias**

| Variável | Valor | Ambiente |
|----------|-------|----------|
| `DATABASE_URL` | Connection string do Supabase | Production, Preview |
| `APP_SECRET` | String aleatória de 32+ chars | Production, Preview |
| `APP_ID` | `beautyflow` | Production, Preview |
| `OWNER_UNION_ID` | `admin@beautyflow.com` | Production, Preview |

**2.3 Gerar APP_SECRET seguro**
Abra o terminal/PowerShell e rode:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copie o resultado e use como `APP_SECRET`.

**2.4 Variáveis opcionais**

| Variável | Valor | Ambiente | Quando usar |
|----------|-------|----------|-------------|
| `SENTRY_DSN` | DSN do Sentry | Production | Se configurar Sentry |
| `VITE_SENTRY_DSN` | Mesmo DSN | Production | Se configurar Sentry |

**2.5 Salvar**
- Clique em **Save** para cada variável

---

## 3. Rodar Migration no Supabase

### Quando fazer?
- Quando houver nova migration em `supabase/migrations/`
- Ou ao criar banco novo

### Passo a passo

**3.1 Acessar Supabase**
1. Acesse: https://app.supabase.com
2. Clique no projeto **beautyflow**
3. Menu lateral → **SQL Editor**

**3.2 Rodar migration específica**
1. Abra o arquivo da migration (ex: `supabase/migrations/002-rls-policies.sql`)
2. Copie o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **Run**

**3.3 Verificar se funcionou**
1. Vá em **Table Editor**
2. Clique em uma tabela modificada
3. Verifique se as alterações apareceram

**⚠️ Atenção:** Nunca rodar `schema_safe.sql` em banco com dados. Ele é para banco novo. Em banco existente, rodar apenas a migration específica.

---

## 4. Verificar RLS no Supabase

### Quando fazer?
- Após rodar migration 002
- Ou quando suspeitar de problema de segurança

### Passo a passo

**4.1 Acessar Supabase**
1. https://app.supabase.com → projeto beautyflow
2. Menu lateral → **Table Editor**

**4.2 Verificar tabela por tabela**
1. Clique na tabela **clients**
2. Aba superior → **Auth Policies**
3. Deve aparecer: `tenant_isolation_clients`
4. Repita para: `services`, `professionals`, `appointments`, `communications`, `financial_records`, `consent_forms`, `consent_signatures`, `salon_users`

**4.3 Se não aparecer**
- Rode a migration 002 no SQL Editor (ver seção 3)

---

## 5. Configurar Sentry

### Quando fazer?
- Opcional — só se quiser error tracking
- Status: ⏳ **Pendente**

### Passo a passo

**5.1 Criar conta**
1. Acesse: https://sentry.io/signup/
2. Crie conta (gratuito: 1 projeto, 5k erros/mês)
3. Crie projeto → selecione **React**

**5.2 Obter DSN**
1. No projeto Sentry → **Settings** → **Client Keys (DSN)**
2. Copie o DSN (ex: `https://xxx@yyy.ingest.sentry.io/zzz`)

**5.3 Adicionar na Vercel**
1. Vercel Dashboard → projeto beautyflow → **Settings** → **Environment Variables**
2. Adicione:
   - **Name:** `SENTRY_DSN` | **Value:** DSN copiado | **Environment:** Production
   - **Name:** `VITE_SENTRY_DSN` | **Value:** mesmo DSN | **Environment:** Production

**5.4 Verificar**
- O Sentry já está configurado no código (`src/main.tsx` e `api/boot.ts`)
- Basta adicionar as variáveis que ele começa a funcionar

---

## 6. Trocar Senha do Banco Supabase

### Quando fazer?
- Periodicamente (segurança)
- Se suspeitar de vazamento

### Passo a passo

**6.1 Acessar Supabase**
1. https://app.supabase.com → projeto beautyflow
2. Menu lateral → **Project Settings** → **Database**

**6.2 Trocar senha**
1. Seção **Database Password**
2. Clique em **Reset Database Password**
3. Gere senha forte ou use a sugerida
4. **Copie a nova senha**

**6.3 Atualizar connection string**
1. A senha está dentro da `DATABASE_URL`
2. Formato: `postgresql://postgres.[projeto]:[SENHA]@aws...`
3. Substitua a senha antiga pela nova

**6.4 Atualizar na Vercel**
1. Vercel Dashboard → projeto beautyflow → **Settings** → **Environment Variables**
2. Edite `DATABASE_URL` com a nova senha
3. Clique em **Save**

**6.5 Reiniciar deploy**
1. Faça um novo push na branch `main`
2. Ou redeploy manual no Vercel Dashboard

---

## 7. Adicionar Domínio na Whitelist CORS

### Quando fazer?
- Ao adicionar domínio customizado
- Ao usar preview deploy em novo ambiente

### Passo a passo

**7.1 Editar código**
1. Abra `app/api/boot.ts`
2. Encontre a seção `cors({ origin: [...] })`

**7.2 Adicionar domínio**
```typescript
app.use(cors({
  origin: env.isProduction
    ? [
        "https://beautyflow.vercel.app",
        "https://seudominio.com.br",  // ← adicionar aqui
      ]
    : ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
}));
```

**7.3 Commit e deploy**
```bash
git add app/api/boot.ts
git commit -m "feat:[COR] - adiciona dominio na whitelist CORS"
git push origin main
```

---

## Checklist de Ações Manuais

```
□ VERCEL_TOKEN configurado no GitHub
□ Variáveis de ambiente na Vercel (DATABASE_URL, APP_SECRET, etc.)
□ Migration 001 rodada no Supabase (schema inicial)
□ Migration 002 rodada no Supabase (RLS policies)
□ RLS verificado em todas as tabelas
□ SENTRY_DSN configurado (opcional)
□ Senha do banco anotada em local seguro
```

---

## Como Adicionar Nova Ação Manual

Quando o Kimi identificar uma nova ação manual:

1. **Adicionar neste runbook** — na seção correspondente
2. **Adicionar no `SESSION-CONTEXT.md`** — em "Decisões pendentes"
3. **Avisar David** — com destaque em negrito e emoji ⚠️

Formato do aviso:
> ⚠️ **Ação manual necessária:** [descrição]
> - **O quê:** [o que fazer]
> - **Onde:** [URL/local]
> - **Como:** [passos]
