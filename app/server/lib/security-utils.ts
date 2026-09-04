import { TRPCError } from "@trpc/server";
import { checkRateLimit } from "./rate-limit";
import type { TrpcContext } from "../context";

/**
 * Aplica rate limiting em procedures tRPC.
 * Uso: t.procedure.use(rateLimitMiddleware("login", 5, 60_000))
 */
export function rateLimitMiddleware(
  prefix: string,
  maxRequests: number,
  windowMs: number
) {
  return async (opts: { ctx: TrpcContext; next: () => Promise<unknown> }) => {
    const ip =
      opts.ctx.req.headers.get("x-forwarded-for") ||
      opts.ctx.req.headers.get("x-real-ip") ||
      "unknown";

    const key = `${prefix}:${ip}`;
    const result = checkRateLimit(key, maxRequests, windowMs);

    if (!result.allowed) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Muitas requisições. Tente novamente em alguns segundos.",
      });
    }

    return opts.next();
  };
}

/**
 * Sanitiza input de usuário para prevenir XSS.
 * Remove tags HTML e entidades perigosas.
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Valida se um email tem formato básico.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
