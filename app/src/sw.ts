/// <reference lib="es2020" />
/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST?: Array<{ url: string; revision: string | null }>;
};

// Precache dos assets do app (injetado pelo Workbox no build).
// Import dinâmico proposital: no dev o manifest é vazio e o import estático
// do workbox quebrava a avaliação do dev-sw.js (módulo externo não
// resolvido pelo navegador), matando os handlers de push junto.
const manifest = self.__WB_MANIFEST ?? [];
if (manifest.length > 0) {
  void import("workbox-precaching").then(({ precacheAndRoute }) => {
    precacheAndRoute(manifest);
  });
}

// Ativação imediata: sem isso o SW novo fica em "waiting" e o
// navigator.serviceWorker.ready nunca resolve até fechar o navegador
// (era a causa do timeout de 5s no cadastro de push em dev).
self.addEventListener("install", () => {
  void self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", event => {
  let payload: {
    title?: string;
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: Record<string, unknown>;
    actions?: { action: string; title: string }[];
  } = {};
  try {
    payload = event.data?.json() ?? {};
  } catch {
    // mantém vazio
  }

  const title = payload.title ?? "StudioFlow";
  const options: NotificationOptions & {
    actions?: { action: string; title: string }[];
  } = {
    body: payload.body ?? "Você recebeu uma nova notificação.",
    icon: payload.icon ?? "/icon-192.png",
    badge: payload.badge ?? "/icon-192.png",
    tag: payload.tag ?? "studioflow",
    data: payload.data ?? { url: "/dashboard" },
    actions: payload.actions ?? [{ action: "open", title: "Abrir app" }],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const data = event.notification.data as { url?: string } | undefined;
  const url = data?.url ?? "/dashboard";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(clientList => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            void client.navigate(url);
            return client.focus();
          }
        }
        return self.clients.openWindow(url);
      })
  );
});
