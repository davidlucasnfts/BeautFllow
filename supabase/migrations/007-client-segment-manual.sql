-- 08/09/2026 — Status híbrido do cliente: flag de segmento escolhido manualmente
-- Quando segmentManual = true, as regras automáticas (VIP/sumindo/inativo) não mexem no status.
-- Quando false (padrão), o sistema atualiza sozinho conforme gasto/atendimentos e tempo sem vir.

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS "segmentManual" boolean NOT NULL DEFAULT false;
