-- 21/09/2026 — Recuperação de senha (esqueci a senha)
-- Tokens de uso único com expiração de 1h. Guardamos apenas o hash SHA-256
-- do token — quem tem acesso ao banco não consegue reutilizar um token.

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES local_users(id) ON DELETE CASCADE,
  "tokenHash" VARCHAR(64) NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "usedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS password_reset_tokens_user_idx
  ON password_reset_tokens("userId");
