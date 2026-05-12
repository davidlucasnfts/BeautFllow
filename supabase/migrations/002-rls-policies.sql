-- ============================================================
-- MIGRATION 002: RLS Policies (Multi-tenancy)
-- Data: 12/05/2026
-- Descricao: Habilita Row Level Security em todas as tabelas
-- com dados do tenant e cria policies de isolamento
-- ============================================================

-- Habilitar RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_users ENABLE ROW LEVEL SECURITY;

-- Function para verificar acesso ao salon
CREATE OR REPLACE FUNCTION public.user_has_salon_access(target_salon_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM salon_users
    WHERE "userId" = auth.uid()::BIGINT
      AND "salonId" = target_salon_id
      AND "isActive" = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies (só criar se não existirem)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_clients') THEN
    CREATE POLICY tenant_isolation_clients ON clients FOR ALL USING ("salonId" = current_setting('app.current_salon_id')::BIGINT);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_services') THEN
    CREATE POLICY tenant_isolation_services ON services FOR ALL USING ("salonId" = current_setting('app.current_salon_id')::BIGINT);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_professionals') THEN
    CREATE POLICY tenant_isolation_professionals ON professionals FOR ALL USING ("salonId" = current_setting('app.current_salon_id')::BIGINT);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_appointments') THEN
    CREATE POLICY tenant_isolation_appointments ON appointments FOR ALL USING ("salonId" = current_setting('app.current_salon_id')::BIGINT);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_communications') THEN
    CREATE POLICY tenant_isolation_communications ON communications FOR ALL USING ("salonId" = current_setting('app.current_salon_id')::BIGINT);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_financial') THEN
    CREATE POLICY tenant_isolation_financial ON financial_records FOR ALL USING ("salonId" = current_setting('app.current_salon_id')::BIGINT);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_consent_forms') THEN
    CREATE POLICY tenant_isolation_consent_forms ON consent_forms FOR ALL USING ("salonId" = current_setting('app.current_salon_id')::BIGINT);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_consent_signatures') THEN
    CREATE POLICY tenant_isolation_consent_signatures ON consent_signatures FOR ALL USING ("salonId" = current_setting('app.current_salon_id')::BIGINT);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_salon_users') THEN
    CREATE POLICY tenant_isolation_salon_users ON salon_users FOR ALL USING ("salonId" = current_setting('app.current_salon_id')::BIGINT);
  END IF;
END
$$;
