-- 26/09/2026 — Múltiplos serviços por atendimento
-- Snapshot em JSONB dos serviços adicionais feitos no mesmo atendimento
-- (ex.: escova + hidratação). Guarda nome/preço/duração da época, então
-- sobrevive à edição ou exclusão lógica do serviço. O serviço principal
-- continua em "serviceId" (back-compat com agenda pública e relatórios).

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS "extraServices" jsonb NOT NULL DEFAULT '[]'::jsonb;
