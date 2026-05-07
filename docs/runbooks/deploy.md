# Runbook: Deploy

## Visao Geral

Deploy do BeautyFlow na Vercel (serverless).

## Pre-requisitos

- Conta Vercel vinculada ao GitHub
- Projeto Vercel configurado
- Variaveis de ambiente configuradas no dashboard Vercel

## Fluxo de Deploy

### 1. Deploy em Staging (Preview)

```bash
git push origin feature/xxx
```

- Vercel gera preview deployment automaticamente
- URL: `https://beautyflow-xxx.vercel.app`

### 2. Deploy em Producao

```bash
git checkout main
git merge feature/xxx
npm run quality    # lint + type-check + test + format-check
git push origin main
```

- Vercel faz deploy automatico da branch `main`
- URL: `https://beautyflow.vercel.app`

## Variaveis de Ambiente (Vercel Dashboard)

| Variavel | Ambiente | Origem |
|----------|----------|--------|
| `DATABASE_URL` | Production | Supabase Connection String |
| `APP_SECRET` | Production | Gerado aleatoriamente |
| `APP_ID` | Production | Kimi OAuth App ID |
| `KIMI_AUTH_URL` | Production | `https://auth.kimi.com` |
| `KIMI_OPEN_URL` | Production | `https://open.kimi.com` |
| `OWNER_UNION_ID` | Production | Union ID do criador |

## Rollback

1. Acesse Vercel Dashboard > Deployments
2. Encontre o deploy anterior estavel
3. Clique em "Promote to Production"

## Health Check

Apos deploy, verificar:
- `GET /api/trpc/ping` retorna `{ ok: true }`
- Login OAuth funciona
- Dashboard carrega dados do salao
