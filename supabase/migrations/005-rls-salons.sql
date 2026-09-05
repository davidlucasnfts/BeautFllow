-- ============================================================
-- MIGRATION 005: RLS na tabela salons
-- Data: 05/09/2026
-- Descricao: A tabela salons ficou de fora da migration 002.
--            Habilita RLS e cria policy de isolamento pelo
--            mesmo padrao das demais tabelas (contexto do
--            backend define app.current_salon_id).
-- ============================================================

ALTER TABLE salons ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_salons') THEN
    CREATE POLICY tenant_isolation_salons ON salons FOR ALL USING (id = current_setting('app.current_salon_id')::BIGINT);
  END IF;
END
$$;
