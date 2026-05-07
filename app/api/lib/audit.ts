import { getDb } from "../queries/connection";
import { auditLogs } from "@db/schema";
import type { InsertAuditLog } from "@db/schema";

export async function logAudit(
  data: Omit<InsertAuditLog, "id" | "createdAt">
) {
  try {
    await getDb().insert(auditLogs).values(data);
  } catch {
    // Silencioso — nao quebrar operacao principal se audit falhar
  }
}

export function auditAction(
  action: InsertAuditLog["action"],
  entityType: InsertAuditLog["entityType"],
  salonId?: number,
  userId?: number,
  entityId?: number,
  oldValue?: unknown,
  newValue?: unknown
) {
  return logAudit({
    action,
    entityType,
    salonId: salonId ?? null,
    userId: userId ?? null,
    entityId: entityId ?? null,
    oldValue: oldValue ? JSON.stringify(oldValue) : null,
    newValue: newValue ? JSON.stringify(newValue) : null,
  });
}
