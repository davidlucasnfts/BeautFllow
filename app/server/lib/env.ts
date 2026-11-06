import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  appSecret: required("APP_SECRET"),
  corsOrigin: process.env.CORS_ORIGIN ?? "",
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  // Recuperação de senha (Resend). Sem chave, o fluxo funciona em dev
  // logando o link no terminal; em produção é obrigatória.
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  resendFrom:
    process.env.RESEND_FROM ?? "StudioFlow <onboarding@resend.dev>",
  // Notificações push (VAPID). Opcional — sem elas push fica desativado.
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY ?? "",
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY ?? "",
  vapidSubject: process.env.VAPID_SUBJECT ?? "mailto:contato@studioflow.com.br",
};
