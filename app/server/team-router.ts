import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import * as cookie from "cookie";
import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { localUsers, salonInvites, salonUsers, salons } from "@db/schema";
import {
  PLAN_USER_LIMITS,
  PLAN_LABELS,
  Session,
  type Plan,
} from "@contracts/constants";
import { env } from "./lib/env";
import { auditAction } from "./lib/audit";
import { capitalizeWords } from "./lib/format";
import { assertSalonAdmin } from "./lib/tenant";
import { signToken } from "./local-auth-router";
import { getSessionCookieOptions } from "./lib/cookies";

const INVITE_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

const inviteRoleSchema = z.enum(["admin", "professional", "receptionist"]);

function requestOrigin(ctx: { req: Request }): string {
  return (
    ctx.req.headers.get("origin") ||
    env.corsOrigin ||
    "http://localhost:3000"
  );
}

async function setSessionCookie(ctx: { req: Request; resHeaders: Headers }, userId: number, email: string) {
  const token = await signToken({ userId, email });
  const cookieOpts = getSessionCookieOptions(ctx.req.headers);
  ctx.resHeaders.append(
    "Set-Cookie",
    cookie.serialize(Session.cookieName, token, {
      httpOnly: cookieOpts.httpOnly,
      path: cookieOpts.path,
      sameSite: cookieOpts.sameSite?.toLowerCase() as "lax" | "none",
      secure: cookieOpts.secure,
      maxAge: 7 * 24 * 60 * 60, // 7 dias
    })
  );
}

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

      // Sem chave do Resend: não quebra — devolve o link para cópia manual
      let emailSent = false;
      if (env.resendApiKey) {
        const { Resend } = await import("resend");
        const resend = new Resend(env.resendApiKey);
        const { error } = await resend.emails.send({
          from: env.resendFrom,
          to: input.email,
          subject: `Convite para equipe — ${salon.name}`,
          text: `Você foi convidado(a) para a equipe de ${salon.name} no StudioFlow.\n\nCrie sua senha e entre no sistema por este link (válido por 7 dias):\n${link}\n\nSe não esperava este convite, ignore este e-mail.`,
        });
        emailSent = !error;
      } else if (!env.isProduction) {
        console.log(`[team-invite] Link do convite: ${link}`);
      }

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

  getInvite: publicQuery
    .input(z.object({ token: z.string().min(10) }))
    .query(async ({ input }) => {
      const invite = await getDb().query.salonInvites.findFirst({
        where: eq(salonInvites.token, input.token),
      });
      if (!invite || invite.status !== "pending" || invite.expiresAt < new Date()) {
        return null;
      }
      const salon = await getDb().query.salons.findFirst({
        where: eq(salons.id, invite.salonId),
        columns: { name: true },
      });
      return { email: invite.email, role: invite.role, salonName: salon?.name ?? "" };
    }),

  acceptInvite: publicQuery
    .input(
      z.object({
        token: z.string().min(10),
        name: z.string().min(2).max(255),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const invite = await db.query.salonInvites.findFirst({
        where: eq(salonInvites.token, input.token),
      });
      if (!invite || invite.status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Convite inválido ou já utilizado.",
        });
      }
      if (invite.expiresAt < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Este convite expirou. Peça um novo convite ao responsável.",
        });
      }

      const name = capitalizeWords(input.name);
      const passwordHash = await bcrypt.hash(input.password, 12);

      // Conta já existe? Só atualiza nome/senha. Senão, cria.
      let [user] = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.email, invite.email))
        .limit(1);

      if (user) {
        await db
          .update(localUsers)
          .set({
            name: user.name ?? name,
            passwordHash,
            lastSignInAt: new Date(),
          })
          .where(eq(localUsers.id, user.id));
      } else {
        const [created] = await db
          .insert(localUsers)
          .values({ email: invite.email, name, passwordHash })
          .returning();
        user = created;
      }

      await db
        .insert(salonUsers)
        .values({ salonId: invite.salonId, userId: user.id, role: invite.role })
        .onConflictDoUpdate({
          target: salonUsers.userId,
          set: { salonId: invite.salonId, role: invite.role, isActive: true },
        });

      await db
        .update(salonInvites)
        .set({ status: "accepted" })
        .where(eq(salonInvites.id, invite.id));

      await auditAction(
        "create",
        "salon_user",
        invite.salonId,
        user.id,
        user.id,
        undefined,
        { role: invite.role, via: "invite" }
      );

      await setSessionCookie(ctx, user.id, user.email);

      return {
        success: true,
        user: { id: user.id, email: user.email, name: user.name },
        salonId: invite.salonId,
      };
    }),
});
