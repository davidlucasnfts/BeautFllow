-- Data: 04/10/2026
-- Padroniza nomes já cadastrados: inicial maiúscula de cada palavra
-- (mesma regra aplicada no backend em lib/format.ts -> capitalizeWords)

UPDATE products SET name = initcap(name) WHERE name IS NOT NULL;
UPDATE services SET name = initcap(name) WHERE name IS NOT NULL;
UPDATE clients SET name = initcap(name) WHERE name IS NOT NULL;
UPDATE professionals SET name = initcap(name) WHERE name IS NOT NULL;
