import { z } from "zod";
import bcrypt from "bcryptjs";
import * as cookie from "cookie";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { localUsers, salonInvites, salonUsers, salons } from "@db/schema";
import { Session } from "@contracts/constants";
import { auditAction } from "./lib/audit";
import { capitalizeWords } from "./lib/format";
import { signToken } from "./local-auth-router";
import { getSessionCookieOptions } from "./lib/cookies";

async function setSessionCookie(
  ctx: { req: Request; resHeaders: Headers },
  userId: number,
  email: string
) {
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

// Fluxos públicos de convite: consultar e aceitar (sem login)
export const inviteRouter = createRouter({
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
