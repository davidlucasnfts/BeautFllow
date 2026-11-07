import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import * as Sentry from "@sentry/react";
import { Toaster } from "sonner";
import "./index.css";
import { TRPCProvider } from "@/providers/trpc";
import { SalonProvider } from "@/providers/salon";
import App from "./App.tsx";

// Registra o service worker para PWA + notificações push.
// Não usamos o helper virtual:pwa-register: no nosso setup o módulo
// virtual caía no fallback do SPA (devolvia index.html) e o registro
// nunca acontecia. A URL é explícita por ambiente:
// dev → /dev-sw.js?dev-sw (gerado em runtime pelo vite-plugin-pwa, como módulo)
// prod → /sw.js (bundle do build, formato clássico injetado pelo Workbox)
if ("serviceWorker" in navigator) {
  const swUrl = import.meta.env.DEV ? "/dev-sw.js?dev-sw" : "/sw.js";
  navigator.serviceWorker
    .register(swUrl, import.meta.env.DEV ? { type: "module" } : undefined)
    .then(registration => {
      console.log("[pwa] Service worker registrado:", registration.scope);
    })
    .catch(error => {
      console.error("[pwa] Erro ao registrar service worker:", error);
    });
}

// Sentry — error tracking (só em produção)
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
  });
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");
createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <TRPCProvider>
        <SalonProvider>
          <App />
          <Toaster richColors />
        </SalonProvider>
      </TRPCProvider>
    </BrowserRouter>
  </StrictMode>
);
