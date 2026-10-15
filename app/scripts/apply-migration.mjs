// Aplica uma migration SQL no banco usando a DATABASE_URL do .env
// (mesma conexão do app — sem precisar de psql nem Supabase CLI).
// Uso: node scripts/apply-migration.mjs ../supabase/migrations/015-financial-expense.sql
import "dotenv/config";
import postgres from "postgres";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const migrationPath = resolve(root, process.argv[2]);

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL nao encontrada no .env");
  process.exit(1);
}

const sql = readFileSync(migrationPath, "utf8");
const client = postgres(process.env.DATABASE_URL, { prepare: false });

try {
  await client.unsafe(sql);
  console.log("migration aplicada:", process.argv[2]);
} catch (err) {
  // enum ja existente = idempotente, nao é erro
  if (String(err.message).includes("already exists")) {
    console.log("já existia (idempotente):", process.argv[2]);
  } else {
    console.error("falhou:", err.message);
    process.exitCode = 1;
  }
} finally {
  await client.end();
}
