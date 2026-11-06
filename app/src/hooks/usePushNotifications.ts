import { useEffect, useState } from "react";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { toast } from "sonner";

function sanitizeVapidKey(key: string): string {
  return key.replace(/\s/g, "").replace(/^["']|["']$/g, "").trim();
}

function isValidBase64Url(key: string): boolean {
  return /^[A-Za-z0-9_-]+=*$/.test(key) && key.length >= 80;
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

function decodeVapidKey(key: string): Uint8Array | null {
  try {
    const bytes = new Uint8Array(urlBase64ToUint8Array(key));
    // Chave P-256 pública em raw: 65 bytes (0x04 + 32 + 32)
    if (bytes.length !== 65 || bytes[0] !== 0x04) return null;
    return bytes;
  } catch {
    return null;
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} demorou mais de ${ms}ms`)), ms)
    ),
  ]);
}

export function usePushNotifications() {
  const { salon } = useSalon();
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [readyError, setReadyError] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const publicKeyQuery = trpc.push.publicKey.useQuery(undefined, {
    enabled: supported && !!salon,
  });
  const subscribeMutation = trpc.push.subscribe.useMutation({
    onSuccess: () => {
      utils.push.publicKey.invalidate();
      setSubscribed(true);
      toast.success("Notificações ativadas");
    },
    onError: e => toast.error(e.message),
  });
  const unsubscribeMutation = trpc.push.unsubscribe.useMutation({
    onSuccess: () => {
      setSubscribed(false);
      toast.success("Notificações desativadas");
    },
    onError: e => toast.error(e.message),
  });

  useEffect(() => {
    const isSupported =
      "serviceWorker" in navigator && "PushManager" in window;
    setSupported(isSupported);
  }, []);

  useEffect(() => {
    if (!supported || !salon) return;

    async function checkExistingSubscription() {
      try {
        const registration = await withTimeout(
          navigator.serviceWorker.ready,
          5000,
          "service worker"
        );
        const subscription = await registration.pushManager.getSubscription();
        setSubscribed(!!subscription);
        setReadyError(null);
      } catch (e) {
        console.error("[push] Service worker não ficou pronto:", e);
        setSubscribed(false);
        setReadyError(
          "Service worker não carregou. Recarregue a página ou limpe o cache."
        );
      }
    }

    void checkExistingSubscription();
  }, [supported, salon]);

  async function subscribe() {
    if (!salon || !publicKeyQuery.data?.publicKey) return;
    const originalKey = publicKeyQuery.data.publicKey;
    const rawKey = sanitizeVapidKey(originalKey);
    console.log("[push] Chave original (comprimento):", originalKey.length);
    console.log("[push] Chave sanitizada (comprimento):", rawKey.length);
    console.log("[push] Chave sanitizada (início/fim):", `${rawKey.slice(0, 10)}...${rawKey.slice(-10)}`);

    if (!isValidBase64Url(rawKey)) {
      console.error("[push] Chave VAPID inválida:", originalKey);
      toast.error(
        `Chave VAPID configurada incorretamente (${originalKey.length} chars). Verifique a variável VAPID_PUBLIC_KEY na Vercel.`
      );
      return;
    }

    const decoded = decodeVapidKey(rawKey);
    if (!decoded) {
      console.error("[push] Chave VAPID não decodifica para 65 bytes:", rawKey);
      toast.error(
        "Chave VAPID pública inválida. Ela precisa ser uma chave P-256 de 65 bytes em base64url."
      );
      return;
    }

    setLoading(true);
    try {
      const registration = await withTimeout(
        navigator.serviceWorker.ready,
        5000,
        "service worker"
      );
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: decoded.buffer as ArrayBuffer,
      });
      const subJson = subscription.toJSON();
      if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) {
        toast.error("Não foi possível ativar as notificações.");
        return;
      }
      subscribeMutation.mutate({
        salonId: salon.id,
        endpoint: subJson.endpoint,
        p256dh: subJson.keys.p256dh,
        auth: subJson.keys.auth,
      });
    } catch (e) {
      console.error("[push] Erro ao assinar:", e);
      toast.error("Permissão negada ou navegador não suporta push.");
    } finally {
      setLoading(false);
    }
  }

  async function unsubscribe() {
    if (!salon) return;
    setLoading(true);
    try {
      const registration = await withTimeout(
        navigator.serviceWorker.ready,
        5000,
        "service worker"
      );
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        const subJson = subscription.toJSON();
        if (subJson.endpoint) {
          unsubscribeMutation.mutate({
            salonId: salon.id,
            endpoint: subJson.endpoint,
          });
        }
      }
      setSubscribed(false);
    } catch (e) {
      console.error("[push] Erro ao cancelar assinatura:", e);
      toast.error("Erro ao desativar notificações.");
    } finally {
      setLoading(false);
    }
  }

  return {
    supported,
    subscribed,
    loading,
    readyError,
    subscribe,
    unsubscribe,
    publicKey: publicKeyQuery.data?.publicKey,
  };
}
