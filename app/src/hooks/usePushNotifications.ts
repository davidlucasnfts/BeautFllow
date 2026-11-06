import { useEffect, useState } from "react";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { toast } from "sonner";

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

export function usePushNotifications() {
  const { salon } = useSalon();
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
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
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setSubscribed(!!subscription);
      } catch {
        setSubscribed(false);
      }
    }

    void checkExistingSubscription();
  }, [supported, salon]);

  async function subscribe() {
    if (!salon || !publicKeyQuery.data?.publicKey) return;
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          publicKeyQuery.data.publicKey
        ),
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
      const registration = await navigator.serviceWorker.ready;
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
    subscribe,
    unsubscribe,
    publicKey: publicKeyQuery.data?.publicKey,
  };
}
