import { eq, and } from "drizzle-orm";
import { getDb } from "./connection";
import { pushSubscriptions } from "@db/schema";

export async function getSubscriptionsBySalon(salonId: number) {
  const db = getDb();
  return db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.salonId, salonId));
}

export async function getSubscriptionByEndpoint(endpoint: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.endpoint, endpoint))
    .limit(1);
  return rows[0] ?? null;
}

export async function createPushSubscription(data: {
  salonId: number;
  userId: number;
  endpoint: string;
  p256dh: string;
  auth: string;
}) {
  const db = getDb();
  // evita duplicatas: se o endpoint já existe, atualiza o usuário/salão
  const existing = await getSubscriptionByEndpoint(data.endpoint);
  if (existing) {
    return db
      .update(pushSubscriptions)
      .set({ salonId: data.salonId, userId: data.userId })
      .where(eq(pushSubscriptions.id, existing.id))
      .returning();
  }
  return db.insert(pushSubscriptions).values(data).returning();
}

export async function deletePushSubscription(endpoint: string, userId: number) {
  const db = getDb();
  return db
    .delete(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.endpoint, endpoint),
        eq(pushSubscriptions.userId, userId)
      )
    );
}
