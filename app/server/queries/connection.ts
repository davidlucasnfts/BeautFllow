import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;
let currentDatabaseUrl: string;

export function getDb() {
  // Recria conexão se DATABASE_URL mudar (evita cache de senha antiga)
  if (!instance || currentDatabaseUrl !== env.databaseUrl) {
    currentDatabaseUrl = env.databaseUrl;
    // idle_timeout: fecha conexões ociosas antes do Supabase encerrar,
    // evitando erro "Failed query" ao reusar conexão morta (pooler mata
    // conexões paradas; sem isso a 1ª query após um tempo parado falhava)
    const client = postgres(env.databaseUrl, {
      prepare: false,
      idle_timeout: 20,
      max_lifetime: 60 * 5,
      connect_timeout: 30,
    });
    instance = drizzle(client, { schema: fullSchema });
  }
  return instance;
}

// Helper para verificar se o banco está acessível
export async function checkDbConnection(): Promise<boolean> {
  try {
    const db = getDb();
    await db.query.users.findFirst({ columns: { id: true } });
    return true;
  } catch {
    return false;
  }
}
