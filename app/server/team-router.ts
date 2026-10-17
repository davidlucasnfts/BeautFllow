import { z } from "zod";
import crypto from "node:crypto";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { localUsers, salonInvites, salonUsers, salons } from "@db/schema";
import {
  PLAN_USER_LIMITS,
  PLAN_LABELS,
  type Plan,
} from "@contracts/constants";
import { auditAction } from "./lib/audit";
import { assertSalonAdmin } from "./lib/tenant";
import { requestOrigin, sendInviteEmail } from "./team-invite-mail";

const INVITE_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

const inviteRoleSchema = z.enum(["admin", "professional", "receptionist"]);

export const teamRouter = createRouter({
  list: authedQuery
    .input(z.object({ salonId: z.number() }))
    .query(async ({ ctx, input }) => {
      await assertSalonAdmin(ctx.user.id, input.salonId);
      const db = getDb();

      const members = await db
        .select({
          membershipId: salonUsers.id,
          userId: salonUsers.userId,
          role: salonUsers.role,
          isActive: salonUsers.isActive,
          createdAt: salonUsers.createdAt,
          name: localUsers.name,
          email: localUsers.email,
        })
        .from(salonUsers)
        .innerJoin(localUsers, eq(localUsers.id, salonUsers.userId))
        .where(eq(salonUsers.salonId, input.salonId))
        .orderBy(desc(salonUsers.createdAt));

      const invites = await db
        .select()
        .from(salonInvites)
        .where(
          and(
            eq(salonInvites.salonId, input.salonId),
            eq(salonInvites.status, "pending")
          )
        )
        .orderBy(desc(salonInvites.createdAt));

      return { members, invites };
    }),

  invite: authedQuery
    .input(
      z.object({
        salonId: z.number(),
        email: z.string().email(),
        role: inviteRoleSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertSalonAdmin(ctx.user.id, input.salonId);
      const db = getDb();

      const salon = await db.query.salons.findFirst({
        where: eq(salons.id, input.salonId),
      });
      if (!salon) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Salão não encontrado." });
      }

      // Limite de acessos do plano (conta membros ativos do salão)
      const plan = salon.plan as Plan;
      const limit = PLAN_USER_LIMITS[plan] ?? PLAN_USER_LIMITS.free;
      if (Number.isFinite(limit)) {
        const activeMembers = await db
          .select({ id: salonUsers.id })
          .from(salonUsers)
          .where(
            and(
              eq(salonUsers.salonId, input.salonId),
              eq(salonUsers.isActive, true)
            )
          );
        if (activeMembers.length >= limit) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `Seu plano ${PLAN_LABELS[plan]} permite até ${limit} ${
              limit === 1 ? "acesso" : "acessos"
            }. Faça upgrade para adicionar mais.`,
          });
        }
      }

      // Já é membro ativo?
      const [existingUser] = await db
        .select({ id: localUsers.id })
        .from(localUsers)
        .where(eq(localUsers.email, input.email))
        .limit(1);
      if (existingUser) {
        const existingMembership = await db.query.salonUsers.findFirst({
          where: and(
            eq(salonUsers.userId, existingUser.id),
            eq(salonUsers.salonId, input.salonId),
            eq(salonUsers.isActive, true)
          ),
        });
        if (existingMembership) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Este e-mail já faz parte da equipe.",
          });
        }
      }

      // Convite pendente para o mesmo e-mail? Reaproveita (recria token e prazo)
      const pending = await db.query.salonInvites.findFirst({
        where: and(
          eq(salonInvites.salonId, input.salonId),
          eq(salonInvites.email, input.email),
          eq(salonInvites.status, "pending")
        ),
      });

      const token = crypto.randomUUID();
      let inviteId: number;

      if (pending) {
        await db
          .update(salonInvites)
          .set({
            role: input.role,
            token,
            expiresAt: new Date(Date.now() + INVITE_EXPIRES_MS),
          })
          .where(eq(salonInvites.id, pending.id));
        inviteId = pending.id;
      } else {
        const [created] = await db
          .insert(salonInvites)
          .values({
            salonId: input.salonId,
            email: input.email,
            role: input.role,
            token,
            invitedBy: ctx.user.id,
            expiresAt: new Date(Date.now() + INVITE_EXPIRES_MS),
          })
          .returning();
        inviteId = created.id;
      }

      await auditAction(
        "create",
        "team_invite",
        input.salonId,
        ctx.user.id,
        inviteId,
        undefined,
        { email: input.email, role: input.role }
      );

      const link = `${requestOrigin(ctx)}/convite?token=${token}`;
      const emailSent = await sendInviteEmail({
        salonName: salon.name,
        email: input.email,
        link,
      });

      return { success: true, emailSent, link: emailSent ? undefined : link };
    }),

  // Reenvia o e-mail do convite com o MESMO token/link (não regenera).
  resend: authedQuery
    .input(z.object({ salonId: z.number(), inviteId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await assertSalonAdmin(ctx.user.id, input.salonId);
      const db = getDb();

      const invite = await db.query.salonInvites.findFirst({
        where: and(
          eq(salonInvites.id, input.inviteId),
          eq(salonInvites.salonId, input.salonId)
        ),
      });
      if (!invite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Convite não encontrado nesta equipe.",
        });
      }
      if (invite.status === "accepted") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Este convite já foi aceito.",
        });
      }
      if (invite.status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Este convite foi cancelado. Crie um novo convite.",
        });
      }
      if (invite.expiresAt < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Este convite expirou. Cancele e crie um novo convite.",
        });
      }

      const salon = await db.query.salons.findFirst({
        where: eq(salons.id, input.salonId),
        columns: { name: true },
      });

      const link = `${requestOrigin(ctx)}/convite?token=${invite.token}`;
      const emailSent = await sendInviteEmail({
        salonName: salon?.name ?? "sua equipe",
        email: invite.email,
        link,
      });

      await auditAction(
        "update",
        "team_invite",
        input.salonId,
        ctx.user.id,
        invite.id,
        undefined,
        { resent: true, email: invite.email }
      );

      return { success: true, emailSent, link: emailSent ? undefined : link };
    }),

  cancelInvite: authedQuery
    .input(z.object({ salonId: z.number(), inviteId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await assertSalonAdmin(ctx.user.id, input.salonId);
      const db = getDb();

      const invite = await db.query.salonInvites.findFirst({
        where: and(
          eq(salonInvites.id, input.inviteId),
          eq(salonInvites.salonId, input.salonId)
        ),
      });
      if (!invite || invite.status !== "pending") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Convite não encontrado ou já resolvido.",
        });
      }

      await db
        .update(salonInvites)
        .set({ status: "cancelled" })
        .where(eq(salonInvites.id, invite.id));

      await auditAction(
        "update",
        "team_invite",
        input.salonId,
        ctx.user.id,
        invite.id,
        { status: "pending" },
        { status: "cancelled" }
      );

      return { success: true };
    }),

  removeMember: authedQuery
    .input(z.object({ salonId: z.number(), membershipId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await assertSalonAdmin(ctx.user.id, input.salonId);
      const db = getDb();

      const membership = await db.query.salonUsers.findFirst({
        where: and(
          eq(salonUsers.id, input.membershipId),
          eq(salonUsers.salonId, input.salonId)
        ),
      });
      if (!membership || !membership.isActive) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Membro não encontrado nesta equipe.",
        });
      }
      if (membership.role === "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "O dono do estabelecimento não pode ser removido.",
        });
      }

      // Exclusão lógica: o vínculo fica inativo (histórico preservado
      // e reconvite futuro reativa pelo onConflictDoUpdate de addUserToSalon)
      await db
        .update(salonUsers)
        .set({ isActive: false })
        .where(eq(salonUsers.id, membership.id));

      await auditAction(
        "delete",
        "salon_user",
        input.salonId,
        ctx.user.id,
        membership.userId,
        { role: membership.role },
        undefined
      );

      return { success: true };
    }),
});
