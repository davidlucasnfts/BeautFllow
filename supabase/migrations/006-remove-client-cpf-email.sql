-- ============================================================
-- MIGRATION 006: Remove CPF e e-mail do cadastro de clientes
-- Data: 05/09/2026
-- Descricao: CPF é dado sensível (LGPD) sem finalidade no
--            sistema e e-mail não é usado no contato (canal
--            principal é WhatsApp no telefone). Remove as
--            colunas cpf e email da tabela clients.
-- ============================================================

ALTER TABLE clients DROP COLUMN IF EXISTS cpf;
ALTER TABLE clients DROP COLUMN IF EXISTS email;
