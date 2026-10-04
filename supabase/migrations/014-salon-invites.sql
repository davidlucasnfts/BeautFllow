-- ============================================================
-- MIGRATION 014: Convites de equipe (salon_invites)
-- Data: 04/10/2026
-- Descricao: Tabela de convites para adicionar membros à equipe
-- do salão (controle de acessos). Token uuid único, validade de
-- 7 dias, RLS por tenant no padrão da migration 002.
-- ============================================================

CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'cancelled');

CREATE TABLE salon_invites (
  id SERIAL PRIMARY KEY,
  "salonId" BIGINT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  email VARCHAR(320) NOT NULL,
  role salon_user_role NOT NULL DEFAULT 'professional'
    CHECK (role IN ('admin', 'professional', 'receptionist')),
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  status invite_status NOT NULL DEFAULT 'pending',
  "invitedBy" BIGINT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX salon_invites_salon_idx ON salon_invites ("salonId");
CREATE INDEX salon_invites_token_idx ON salon_invites (token);
CREATE INDEX salon_invites_status_idx ON salon_invites (status);

-- RLS por tenant (padrão da migration 002)
ALTER TABLE salon_invites ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_salon_invites') THEN
    CREATE POLICY tenant_isolation_salon_invites ON salon_invites FOR ALL USING ("salonId" = current_setting('app.current_salon_id')::BIGINT);
  END IF;
END $$;
