import { env } from "./lib/env";

export function requestOrigin(ctx: { req: Request }): string {
  return (
    ctx.req.headers.get("origin") ||
    env.corsOrigin ||
    "http://localhost:3000"
  );
}

interface SendInviteEmailParams {
  salonName: string;
  email: string;
  link: string;
}

/**
 * Envia o e-mail de convite via Resend. Sem chave configurada não quebra:
 * apenas loga o link (fora de produção) e devolve false para a UI
 * mostrar o link para cópia manual.
 */
export async function sendInviteEmail({
  salonName,
  email,
  link,
}: SendInviteEmailParams): Promise<boolean> {
  if (!env.resendApiKey) {
    if (!env.isProduction) {
      console.log(`[team-invite] Link do convite: ${link}`);
    }
    return false;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(env.resendApiKey);
  const { error } = await resend.emails.send({
    from: env.resendFrom,
    to: email,
    subject: `Convite para equipe — ${salonName}`,
    text: `Você foi convidado(a) para a equipe de ${salonName} no StudioFlow.\n\nCrie sua senha e entre no sistema por este link (válido por 7 dias):\n${link}\n\nSe não esperava este convite, ignore este e-mail.`,
  });
  if (error) {
    console.error("[team-invite] Falha ao enviar e-mail:", error);
  }
  return !error;
}
