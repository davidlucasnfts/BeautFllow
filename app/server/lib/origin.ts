import { env } from "./env";

/** Origens permitidas para montar links externos (convite de equipe,
 *  recuperação de senha). O header `origin` só é aceito se estiver na
 *  allowlist — evita links com domínio arbitrário se o header for
 *  manipulado (phishing com token de convite/reset). */
export function requestOrigin(ctx: { req: Request }): string {
  const origin = ctx.req.headers.get("origin");
  const allowed = env.isProduction
    ? [env.corsOrigin || "https://studioflow.vercel.app"]
    : ["http://localhost:3000", "http://localhost:5173"];

  if (origin && allowed.includes(origin)) return origin;
  return env.corsOrigin || "http://localhost:3000";
}
