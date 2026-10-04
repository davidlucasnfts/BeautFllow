import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "../queries/connection";
import { salonUsers } from "@db/schema";
import { canAccess, type PermissionArea } from "@contracts/permissions";

async function findMembership(userId: number, salonId: number) {
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

/** Exige papel owner no vínculo (ex.: edição do perfil do salão) */
export async function assertSalonOwner(
  userId: number,
  salonId: number
): Promise<void> {
  const membership = await findMembership(userId, salonId);
  if (!membership || membership.role !== "owner") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Somente o dono do estabelecimento pode fazer isso.",
    });
  }
}

/**
 * Guard de área: exige membro ativo do salão E papel com acesso à área
 * conforme a matriz de permissões (contracts/permissions.ts).
 */
export async function assertSalonRole(
  userId: number,
  salonId: number,
  area: PermissionArea
): Promise<void> {
  const membership = await findMembership(userId, salonId);
  if (!membership) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acesso negado a este estabelecimento.",
    });
  }
  if (!canAccess(membership.role, area)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Seu papel não tem permissão para acessar esta área.",
    });
  }
}
