-- MIGRATION 004: Constraint unica em salon_users.userId
-- Data: 04/09/2026
-- Descricao: Adiciona UNIQUE em salon_users("userId"). O codigo faz
--            ON CONFLICT ("userId") ao vincular usuario ao salao
--            (addUserToSalon, papel owner no onboarding) e o PostgreSQL
--            exige constraint unica para o upsert funcionar.
--            Sem isso, criar o negocio no onboarding falha.

CREATE UNIQUE INDEX IF NOT EXISTS salon_users_user_id_key ON salon_users ("userId");
