import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "../queries/connection";
import { salonUsers } from "@db/schema";

type SalonMembership = typeof salonUsers.$inferSelect;

async function findMembership(
  userId: number,
  salonId: number
): Promise<SalonMembership | undefined> {
  return getDb().query.salonUsers.findFirst({
    where: and(
      eq(salonUsers.salonId, salonId),
      eq(salonUsers.userId, userId),
      eq(salonUsers.isActive, true)
    ),
  });
}

/**
 * Garante que o usuário autenticado é membro ativo do salão informado.
 * Trava de isolamento por tenant (LGPD): sem vínculo, acesso negado.
 */
export async function assertSalonMember(
  userId: number,
  salonId: number
): Promise<void> {
  const membership = await findMembership(userId, salonId);
  if (!membership) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acesso negado a este estabelecimento.",
    });
  }
}

/**
 * Igual ao assertSalonMember, mas exige papel owner/admin no vínculo.
 * Usado em operações administrativas do salão (update, updateSettings).
 */
export async function assertSalonAdmin(
  userId: number,
  salonId: number
): Promise<void> {
  const membership = await findMembership(userId, salonId);
  if (
    !membership ||
    (membership.role !== "owner" && membership.role !== "admin")
  ) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acesso negado a este estabelecimento.",
    });
  }
}
