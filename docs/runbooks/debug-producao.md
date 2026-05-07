# Runbook: Debug em Producao

## Logs

### Vercel Functions Logs
```
Vercel Dashboard > Project > Functions > [function] > Logs
```

### Supabase Logs
```
Supabase Dashboard > Database > Logs
```

## Comandos Uteis

```bash
# Verificar se API responde
curl https://beautyflow.vercel.app/api/trpc/ping

# Verificar headers de seguranca
curl -I https://beautyflow.vercel.app

# Testar endpoint especifico
curl -H "Authorization: Bearer [token]" \
  https://beautyflow.vercel.app/api/trpc/dashboard.getMetrics
```

## Problemas Comuns

### 500 em endpoints tRPC
1. Verificar `DATABASE_URL` esta configurada
2. Verificar `APP_SECRET` esta configurada
3. Verificar logs do Vercel Functions

### Login OAuth falha
1. Verificar `VITE_KIMI_AUTH_URL` e `VITE_APP_ID`
2. Verificar callback URL no Kimi OAuth App
3. Verificar `APP_SECRET` no backend

### Dados nao carregam
1. Verificar `salonId` no localStorage
2. Verificar RLS policies no Supabase
3. Verificar se usuario tem permissao no salao

## Contato de Escalada

- **Problema de infra:** Vercel Support
- **Problema de banco:** Supabase Support
- **Problema de codigo:** Criar issue no GitHub
