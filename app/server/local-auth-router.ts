import { z } from "zod";
import bcrypt from "bcryptjs";
import * as jose from "jose";
import crypto from "node:crypto";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { localUsers, passwordResetTokens } from "@db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { env } from "./lib/env";
import { TRPCError } from "@trpc/server";
import * as cookie from "cookie";
import { getSessionCookieOptions } from "./lib/cookies";
import { Session } from "@contracts/constants";

const JWT_ALG = "HS256";

async function signToken(payload: {
  userId: number;
  email: string;
}): Promise<string> {
  const secret = new TextEncoder().encode(env.appSecret);
  return new jose.SignJWT(payload as unknown as jose.JWTPayload)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

async function verifyToken(
  token: string
): Promise<{ userId: number; email: string } | null> {
  try {
    const secret = new TextEncoder().encode(env.appSecret);
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: [JWT_ALG],
    });
    return payload as unknown as { userId: number; email: string };
  } catch {
    return null;
  }
}

export async function authenticateLocalRequest(headers: Headers) {
  const cookies = headers.get("cookie") || "";
  const match = cookies.match(new RegExp(`${Session.cookieName}=([^;]+)`));
  const token = match?.[1];
  if (!token) return null;

  const claim = await verifyToken(token);
  if (!claim) return null;

  const db = getDb();
  const [user] = await db
    .select({
      id: localUsers.id,
      email: localUsers.email,
      name: localUsers.name,
      role: localUsers.role,
      unionId: localUsers.email,
      avatar: localUsers.name,
      createdAt: localUsers.createdAt,
      updatedAt: localUsers.updatedAt,
      lastSignInAt: localUsers.lastSignInAt,
    })
    .from(localUsers)
    .where(eq(localUsers.id, claim.userId))
    .limit(1);

  return user ?? null;
}

export const localAuthRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(2).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select({ id: localUsers.id })
        .from(localUsers)
        .where(eq(localUsers.email, input.email))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email já cadastrado",
        });
      }

      const passwordHash = await bcrypt.hash(input.password, 12);

      const [user] = await db
        .insert(localUsers)
        .values({
          email: input.email,
          passwordHash,
          name: input.name ?? input.email.split("@")[0],
        })
        .returning();

      return { success: true, userId: user.id };
    }),

  login: publicQuery
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const [user] = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.email, input.email))
        .limit(1);

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou senha incorretos",
        });
      }

      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou senha incorretos",
        });
      }

      // Atualiza lastSignInAt
      await db
        .update(localUsers)
        .set({ lastSignInAt: new Date() })
        .where(eq(localUsers.id, user.id));

      const token = await signToken({ userId: user.id, email: user.email });

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

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    }),

  changePassword: authedQuery
    .input(
      z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [user] = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.id, ctx.user.id))
        .limit(1);

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Sessão inválida. Faça login novamente.",
        });
      }

      const valid = await bcrypt.compare(
        input.currentPassword,
        user.passwordHash
      );
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Senha atual incorreta",
        });
      }

      const passwordHash = await bcrypt.hash(input.newPassword, 12);
      await db
        .update(localUsers)
        .set({ passwordHash })
        .where(eq(localUsers.id, user.id));

      return { success: true };
    }),

  requestPasswordReset: publicQuery
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [user] = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.email, input.email))
        .limit(1);

      // Resposta genérica: não revela se o e-mail existe no cadastro
      const genericResponse = {
        success: true as const,
        message: "Se este e-mail estiver cadastrado, enviamos o link de recuperação.",
      };
      if (!user) return genericResponse;

      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      await db.insert(passwordResetTokens).values({
        userId: user.id,
        tokenHash,
        expiresAt,
      });

      const origin =
        ctx.req.headers.get("origin") ||
        env.corsOrigin ||
        "http://localhost:3000";
      const link = `${origin}/redefinir-senha?token=${token}`;

      if (env.resendApiKey) {
        const { Resend } = await import("resend");
        const resend = new Resend(env.resendApiKey);
        const { error } = await resend.emails.send({
          from: env.resendFrom,
          to: user.email,
          subject: "Recuperação de senha — StudioFlow",
          text: `Você solicitou a recuperação de senha do StudioFlow.\n\nAbra este link para redefinir sua senha (válido por 1 hora):\n${link}\n\nSe não foi você, ignore este e-mail.`,
        });
        if (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Não foi possível enviar o e-mail. Tente novamente.",
          });
        }
      } else if (!env.isProduction) {
        // Dev sem serviço de e-mail configurado: o link fica no terminal
        console.log(`[password-reset] Link de recuperação: ${link}`);
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Serviço de e-mail não configurado.",
        });
      }

      return genericResponse;
    }),

  resetPassword: publicQuery
    .input(
      z.object({
        token: z.string().min(10),
        newPassword: z.string().min(8),
      })
    )
    .mutation(async ({ input }) => {
      const tokenHash = crypto
        .createHash("sha256")
        .update(input.token)
        .digest("hex");

      const db = getDb();
      const [row] = await db
        .select()
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.tokenHash, tokenHash),
            isNull(passwordResetTokens.usedAt)
          )
        )
        .orderBy(desc(passwordResetTokens.createdAt))
        .limit(1);

      if (!row || row.expiresAt < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Link expirado ou inválido. Solicite um novo.",
        });
      }

      const passwordHash = await bcrypt.hash(input.newPassword, 12);
      await db
        .update(localUsers)
        .set({ passwordHash })
        .where(eq(localUsers.id, row.userId));
      await db
        .update(passwordResetTokens)
        .set({ usedAt: new Date() })
        .where(eq(passwordResetTokens.id, row.id));

      return { success: true };
    }),

  me: publicQuery.query(async ({ ctx }) => {
    const cookies = ctx.req.headers.get("cookie") || "";
    const match = cookies.match(new RegExp(`${Session.cookieName}=([^;]+)`));
    const token = match?.[1];

    if (!token) return null;

    const claim = await verifyToken(token);
    if (!claim) return null;

    const db = getDb();
    const [user] = await db
      .select({
        id: localUsers.id,
        email: localUsers.email,
        name: localUsers.name,
        role: localUsers.role,
      })
      .from(localUsers)
      .where(eq(localUsers.id, claim.userId))
      .limit(1);

    return user ?? null;
  }),

  logout: publicQuery.mutation(async ({ ctx }) => {
    const cookieOpts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "Set-Cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: cookieOpts.httpOnly,
        path: cookieOpts.path,
        sameSite: cookieOpts.sameSite?.toLowerCase() as "lax" | "none",
        secure: cookieOpts.secure,
        maxAge: 0,
      })
    );
    return { success: true };
  }),
});
