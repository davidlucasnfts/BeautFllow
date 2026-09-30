-- 30/09/2026 — Estoque de produtos (aba "Produtos")
-- Controle de entrada e saída de produtos de uso interno do estabelecimento
-- (tintas, shampoos, produtos de pele...). O dono cadastra o produto e dá
-- entrada/saída via movimentações; o saldo (products.quantity) só muda
-- transacionalmente no backend, aplicando a movimentação.

-- Tipo da movimentação: entrada (compra/reposição) ou saída (uso/consumo)
DO $$
BEGIN
  CREATE TYPE stock_movement_type AS ENUM ('in', 'out');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  "salonId" BIGINT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  unit VARCHAR(20) NOT NULL DEFAULT 'un',
  quantity NUMERIC(10, 3) NOT NULL DEFAULT 0,
  "minQuantity" NUMERIC(10, 3) NOT NULL DEFAULT 0,
  "costPrice" NUMERIC(10, 2) NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS products_salon_idx ON products("salonId");

CREATE TABLE IF NOT EXISTS stock_movements (
  id SERIAL PRIMARY KEY,
  "salonId" BIGINT NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  "productId" BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type stock_movement_type NOT NULL,
  quantity NUMERIC(10, 3) NOT NULL,
  reason TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS stock_movements_salon_idx ON stock_movements("salonId");
CREATE INDEX IF NOT EXISTS stock_movements_product_idx ON stock_movements("productId");

-- RLS: isolamento por tenant (mesmo padrão da migration 002)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_products') THEN
    CREATE POLICY tenant_isolation_products ON products FOR ALL USING ("salonId" = current_setting('app.current_salon_id')::BIGINT);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenant_isolation_stock_movements') THEN
    CREATE POLICY tenant_isolation_stock_movements ON stock_movements FOR ALL USING ("salonId" = current_setting('app.current_salon_id')::BIGINT);
  END IF;
END
$$;
