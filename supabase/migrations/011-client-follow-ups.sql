-- 29/09/2026 — Retorno programado pós-procedimento
-- Serviços ganham configuração de retorno (dias + serviço sugerido). Ao
-- concluir um atendimento, o sistema cria um registro em client_follow_ups
-- para o dono acompanhar e agendar o retorno (ex.: coloração → hidratação
-- em 15 dias).

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS "followUpDays" integer NOT NULL DEFAULT 0;
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS "followUpServiceId" bigint;

DO $$
BEGIN
  CREATE TYPE follow_up_status AS ENUM ('pending', 'scheduled', 'dismissed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS client_follow_ups (
  id SERIAL PRIMARY KEY,
  "salonId" BIGINT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  "clientId" BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  "professionalId" BIGINT REFERENCES professionals(id) ON DELETE SET NULL,
  "originAppointmentId" BIGINT,
  "serviceId" BIGINT REFERENCES services(id) ON DELETE SET NULL,
  "dueDate" DATE NOT NULL,
  status follow_up_status NOT NULL DEFAULT 'pending',
  "scheduledAppointmentId" BIGINT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS client_follow_ups_salon_idx
  ON client_follow_ups("salonId");

CREATE INDEX IF NOT EXISTS client_follow_ups_client_idx
  ON client_follow_ups("clientId");
