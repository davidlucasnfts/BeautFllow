import webPush from "web-push";
import { env } from "./env";
import { getSubscriptionsBySalon } from "../queries/push";

const vapidPublicKey = env.vapidPublicKey;
const vapidPrivateKey = env.vapidPrivateKey;
const vapidSubject = env.vapidSubject;

let configured = false;

export function configureWebPush() {
  if (configured) return;
  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    console.warn(
      "[push] VAPID keys não configuradas. Notificações push desativadas."
    );
    return;
  }
  webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  configured = true;
}

export function getVapidPublicKey(): string | undefined {
  return vapidPublicKey;
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: { action: string; title: string }[];
}

export async function sendPushNotification(
  endpoint: string,
  p256dh: string,
  auth: string,
  payload: PushPayload
): Promise<void> {
  configureWebPush();
  if (!configured) {
    throw new Error("VAPID não configurado");
  }
  await webPush.sendNotification(
    { endpoint, keys: { p256dh, auth } },
    JSON.stringify(payload)
  );
}

export async function notifySalon(
  salonId: number,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  configureWebPush();
  if (!configured) {
    return { sent: 0, failed: 0 };
  }
  const subscriptions = await getSubscriptionsBySalon(salonId);
  let sent = 0;
  let failed = 0;
  await Promise.all(
    subscriptions.map(async sub => {
      try {
        await sendPushNotification(
          sub.endpoint,
          sub.p256dh,
          sub.auth,
          payload
        );
        sent++;
      } catch (e) {
        failed++;
        // Subscription inválida/expirada: remove silenciosamente
        if (
          e instanceof Error &&
          (e.message.includes("expired") ||
            e.message.includes("InvalidSubscription") ||
            (e as unknown as { statusCode?: number }).statusCode === 410)
        ) {
          const { deletePushSubscription } = await import("../queries/push");
          await deletePushSubscription(sub.endpoint, sub.userId);
        }
      }
    })
  );
  return { sent, failed };
}
