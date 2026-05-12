-- BeautyFlow — Schema Safe (PostgreSQL)
-- Data: 12/05/2026
-- Gerado automaticamente juntando as migrations
-- Este arquivo é IDEMPOTENTE (pode rodar quantas vezes quiser)
-- Fonte: supabase/migrations/*.sql
-- ============================================================

-- === 001-schema-inicial.sql ===
-- MIGRATION 001: Schema Inicial
-- Data: 05/05/2026
-- Descricao: Tabelas base do BeautyFlow

-- Enums
CREATE TYPE IF NOT EXISTS user_role AS ENUM ('user', 'admin');
CREATE TYPE IF NOT EXISTS plan AS ENUM ('free', 'essential', 'pro', 'business');
CREATE TYPE IF NOT EXISTS salon_user_role AS ENUM ('owner', 'admin', 'professional', 'receptionist');
CREATE TYPE IF NOT EXISTS client_segment AS ENUM ('new', 'active', 'vip', 'at_risk', 'inactive');
CREATE TYPE IF NOT EXISTS appointment_status AS ENUM ('scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'no_show', 'cancelled');
CREATE TYPE IF NOT EXISTS booking_source AS ENUM ('online', 'whatsapp', 'phone', 'walk_in', 'staff');
CREATE TYPE IF NOT EXISTS communication_channel AS ENUM ('whatsapp', 'sms', 'email', 'phone', 'in_app');
CREATE TYPE IF NOT EXISTS communication_direction AS ENUM ('outbound', 'inbound');
CREATE TYPE IF NOT EXISTS communication_type AS ENUM ('confirmation', 'reminder', 'check_in', 'post_care', 'reactivation', 'campaign', 'manual');
CREATE TYPE IF NOT EXISTS communication_status AS ENUM ('pending', 'sent', 'delivered', 'read', 'failed');
CREATE TYPE IF NOT EXISTS record_type AS ENUM ('service', 'product', 'package', 'refund', 'other');
CREATE TYPE IF NOT EXISTS payment_method AS ENUM ('pix', 'credit_card', 'debit_card', 'cash', 'other');

-- Core Users (OAuth)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  "unionId" VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  email VARCHAR(320),
  avatar TEXT,
  role user_role DEFAULT 'user' NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "lastSignInAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Local Auth (email + password)
CREATE TABLE IF NOT EXISTS local_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(320) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role user_role DEFAULT 'user' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  last_sign_in_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Salons (Tenants)
CREATE TABLE IF NOT EXISTS salons (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  email VARCHAR(320),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  "logoUrl" TEXT,
  plan plan DEFAULT 'free' NOT NULL,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  settings TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Salon Users (RBAC per tenant)
CREATE TABLE IF NOT EXISTS salon_users (
  id SERIAL PRIMARY KEY,
  "userId" BIGINT NOT NULL,
  "salonId" BIGINT NOT NULL,
  role salon_user_role DEFAULT 'professional' NOT NULL,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS user_salon_idx ON salon_users ("userId", "salonId");
CREATE INDEX IF NOT EXISTS salon_users_salon_idx ON salon_users ("salonId");

-- Clients (CRM)
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  "salonId" BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(320),
  phone VARCHAR(50) NOT NULL,
  "birthDate" DATE,
  cpf VARCHAR(14),
  notes TEXT,
  tags TEXT,
  segment client_segment DEFAULT 'new' NOT NULL,
  "lastVisitAt" TIMESTAMP,
  "totalVisits" INTEGER DEFAULT 0 NOT NULL,
  "totalSpent" DECIMAL(12,2) DEFAULT 0.00 NOT NULL,
  "consentGiven" BOOLEAN DEFAULT false NOT NULL,
  "consentGivenAt" TIMESTAMP,
  "lgpdAnonymized" BOOLEAN DEFAULT false NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS clients_salon_idx ON clients ("salonId");
CREATE INDEX IF NOT EXISTS clients_phone_idx ON clients (phone);
CREATE INDEX IF NOT EXISTS clients_segment_idx ON clients (segment);

-- Services Catalog
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  "salonId" BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  "durationMinutes" INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  color VARCHAR(7) DEFAULT '#6366f1',
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "requiresConsent" BOOLEAN DEFAULT false NOT NULL,
  "preCareInstructions" TEXT,
  "postCareInstructions" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS services_salon_idx ON services ("salonId");

-- Professionals
CREATE TABLE IF NOT EXISTS professionals (
  id SERIAL PRIMARY KEY,
  "salonId" BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(320),
  phone VARCHAR(50),
  bio TEXT,
  color VARCHAR(7) DEFAULT '#10b981',
  "commissionRate" DECIMAL(5,2) DEFAULT 0.00,
  "workingHours" TEXT,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS professionals_salon_idx ON professionals ("salonId");

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  "salonId" BIGINT NOT NULL,
  "clientId" BIGINT NOT NULL,
  "serviceId" BIGINT NOT NULL,
  "professionalId" BIGINT,
  "appointmentDate" DATE NOT NULL,
  "startTime" TIME NOT NULL,
  "endTime" TIME,
  status appointment_status DEFAULT 'scheduled' NOT NULL,
  notes TEXT,
  source booking_source DEFAULT 'staff' NOT NULL,
  "checkedInAt" TIMESTAMP,
  "completedAt" TIMESTAMP,
  "cancelledAt" TIMESTAMP,
  "cancellationReason" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS appointments_salon_idx ON appointments ("salonId");
CREATE INDEX IF NOT EXISTS appointments_date_idx ON appointments ("appointmentDate");
CREATE INDEX IF NOT EXISTS appointments_client_idx ON appointments ("clientId");

-- Communications (Omnichannel)
CREATE TABLE IF NOT EXISTS communications (
  id SERIAL PRIMARY KEY,
  "salonId" BIGINT NOT NULL,
  "clientId" BIGINT NOT NULL,
  "appointmentId" BIGINT,
  type communication_type DEFAULT 'manual' NOT NULL,
  channel communication_channel DEFAULT 'whatsapp' NOT NULL,
  direction communication_direction DEFAULT 'outbound' NOT NULL,
  content TEXT NOT NULL,
  status communication_status DEFAULT 'pending' NOT NULL,
  "sentAt" TIMESTAMP,
  "deliveredAt" TIMESTAMP,
  "readAt" TIMESTAMP,
  "externalId" VARCHAR(255),
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS communications_salon_idx ON communications ("salonId");
CREATE INDEX IF NOT EXISTS communications_client_idx ON communications ("clientId");

-- Financial Records
CREATE TABLE IF NOT EXISTS financial_records (
  id SERIAL PRIMARY KEY,
  "salonId" BIGINT NOT NULL,
  "clientId" BIGINT,
  "professionalId" BIGINT,
  "appointmentId" BIGINT,
  type record_type DEFAULT 'service' NOT NULL,
  description VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  "commissionAmount" DECIMAL(10,2) DEFAULT 0.00,
  "paymentMethod" payment_method DEFAULT 'pix' NOT NULL,
  "recordDate" DATE NOT NULL,
  notes TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS financial_salon_idx ON financial_records ("salonId");
CREATE INDEX IF NOT EXISTS financial_date_idx ON financial_records ("recordDate");

-- Consent Forms
CREATE TABLE IF NOT EXISTS consent_forms (
  id SERIAL PRIMARY KEY,
  "salonId" BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  "isRequired" BOOLEAN DEFAULT true NOT NULL,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS consent_forms_salon_idx ON consent_forms ("salonId");

-- Consent Signatures
CREATE TABLE IF NOT EXISTS consent_signatures (
  id SERIAL PRIMARY KEY,
  "salonId" BIGINT NOT NULL,
  "clientId" BIGINT NOT NULL,
  "formId" BIGINT NOT NULL,
  "signatureData" TEXT,
  "signedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "ipAddress" VARCHAR(45),
  "userAgent" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS consent_signatures_client_idx ON consent_signatures ("clientId");
CREATE INDEX IF NOT EXISTS consent_signatures_form_idx ON consent_signatures ("formId");

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  "salonId" BIGINT,
  "userId" BIGINT,
  action VARCHAR(50) NOT NULL,
  "entityType" VARCHAR(50) NOT NULL,
  "entityId" BIGINT,
  "oldValue" TEXT,
  "newValue" TEXT,
  "ipAddress" VARCHAR(45),
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS audit_logs_salon_idx ON audit_logs ("salonId");
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs ("createdAt");
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
