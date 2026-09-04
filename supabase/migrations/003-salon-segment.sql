-- ============================================================
-- MIGRATION 003: Segmento do Salão
-- Data: 24/08/2026
-- Descricao: Adiciona segmento do negocio (salao, barbearia,
-- clinica de estetica) na tabela salons
-- ============================================================

-- Criar enum de segmento
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'salon_segment') THEN
    CREATE TYPE salon_segment AS ENUM ('beauty_salon', 'barbershop', 'aesthetic_clinic');
  END IF;
END
$$;

-- Adicionar coluna segment em salons
ALTER TABLE salons ADD COLUMN IF NOT EXISTS segment salon_segment NOT NULL DEFAULT 'beauty_salon';
