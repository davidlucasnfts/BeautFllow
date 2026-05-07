import { z } from "zod";
import bcrypt from "bcryptjs";
import * as jose from "jose";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { localUsers } from "@db/schema";
import { eq } from "drizzle-orm";
import { env } from "./lib/env";
import { TRPCError } from "@trpc/server";
import { setCookie } from "hono/cookie";
import { getSessionCookieOptions } from "./lib/cookies";
import { Session } from "@contracts/constants";

const JWT_ALG = "HS256";

async function signToken(payload: { userId: number; email: string }): Promise<string> {
  const secret = new TextEncoder().encode(env.appSecret);
  return new jose.SignJWT(payload as unknown as jose.JWTPayload)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

async function verifyToken(token: string): Promise<{ userId: number; email: string } | null> {
  try {
    const secret = new TextEncoder().encode(env.appSecret);
    const { payload } = await jose.jwtVerify(token, secret, { algorithms: [JWT_ALG] });
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
      setCookie(ctx as unknown as import("hono").Context, Session.cookieName, token, {
        ...cookieOpts,
        maxAge: 7 * 24 * 60 * 60, // 7 dias
      });

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
    setCookie(ctx as unknown as import("hono").Context, Session.cookieName, "", {
      ...cookieOpts,
      maxAge: 0,
    });
    return { success: true };
  }),
});
