import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import * as Sentry from "@sentry/react";
import { Toaster } from "sonner";
import "./index.css";
import { TRPCProvider } from "@/providers/trpc";
import { SalonProvider } from "@/providers/salon";
import App from "./App.tsx";
import { registerSW } from "virtual:pwa-register";

// Registra o service worker para PWA + notificações push
registerSW({
  immediate: true,
  onRegistered(r) {
    console.log("[pwa] Service worker registrado:", r);
  },
  onRegisterError(e) {
    console.error("[pwa] Erro ao registrar service worker:", e);
  },
});

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
