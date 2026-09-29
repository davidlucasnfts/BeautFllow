-- 29/09/2026 — Pagamentos de comissão aos profissionais
-- Registra todo pagamento feito ao funcionário, independentemente do
-- período. O valor devido é calculado na hora sobre atendimentos
-- concluídos × taxa de comissão atual do profissional.

CREATE TABLE IF NOT EXISTS professional_payments (
  id SERIAL PRIMARY KEY,
  "salonId" BIGINT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  "professionalId" BIGINT NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  "paymentMethod" payment_method NOT NULL DEFAULT 'pix',
  "paidAt" DATE NOT NULL,
  notes TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS professional_payments_salon_idx
  ON professional_payments("salonId");

CREATE INDEX IF NOT EXISTS professional_payments_professional_idx
  ON professional_payments("professionalId");
