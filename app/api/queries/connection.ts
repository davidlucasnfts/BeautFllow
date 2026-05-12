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
    const client = postgres(env.databaseUrl, { prepare: false });
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
