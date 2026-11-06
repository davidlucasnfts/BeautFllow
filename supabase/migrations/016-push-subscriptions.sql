-- 2026-11-06 — Tabela de assinaturas push para notificações de novos agendamentos

CREATE TABLE IF NOT EXISTS "push_subscriptions" (
  "id" SERIAL PRIMARY KEY,
  "salonId" BIGINT NOT NULL,
  "userId" BIGINT NOT NULL,
  "endpoint" TEXT NOT NULL,
  "p256dh" TEXT NOT NULL,
  "auth" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "push_subscriptions_salon_idx" ON "push_subscriptions" ("salonId");
CREATE INDEX IF NOT EXISTS "push_subscriptions_user_idx" ON "push_subscriptions" ("userId");
CREATE INDEX IF NOT EXISTS "push_subscriptions_endpoint_idx" ON "push_subscriptions" ("endpoint");

ALTER TABLE "push_subscriptions" ENABLE ROW LEVEL SECURITY;

-- Isolamento por tenant (mesmo padrão das demais tabelas)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_push_subscriptions') THEN
    CREATE POLICY tenant_isolation_push_subscriptions
      ON "push_subscriptions"
      FOR ALL
      USING ("salonId" = current_setting('app.current_salon_id')::BIGINT);
  END IF;
END
$$;
