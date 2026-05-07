# Runbook: Rollback

## Quando Usar

- Deploy quebrou funcionalidade critica
- Erro 500 em massa
- Dados corrompidos por migration

## Procedimento

### 1. Rollback Rapido (Vercel)

```
Vercel Dashboard > Deployments > [deploy anterior] > Promote to Production
```

Tempo: ~30 segundos

### 2. Rollback de Banco (se necessario)

```bash
# Restaurar backup do Supabase
Supabase Dashboard > Database > Backups > Restore

# Ou reverter migration Drizzle
cd app
npx drizzle-kit migrate   # reverte para schema anterior
```

### 3. Verificacao Pos-Rollback

- [ ] Site acessivel
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Nenhum erro no console

## Comunicacao

1. Notificar usuarios afetados (se houver)
2. Documentar causa raiz
3. Criar ticket para correcao definitiva
