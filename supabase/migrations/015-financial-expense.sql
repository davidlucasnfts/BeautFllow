-- 15/10/2026 — Tipo de lançamento "expense" (despesa) no Financeiro
-- Permite lançar gastos do negócio (aluguel, luz, compra de produto etc.)
-- clientId já é nullable na tabela, então despesa não precisa de cliente.

ALTER TYPE record_type ADD VALUE IF NOT EXISTS 'expense';
