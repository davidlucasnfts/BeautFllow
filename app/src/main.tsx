import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import * as Sentry from "@sentry/react";
import './index.css'
import { TRPCProvider } from "@/providers/trpc"
import { SalonProvider } from "@/providers/salon"
import App from './App.tsx'

// Sentry — error tracking (só em produção)
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');
createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <TRPCProvider>
        <SalonProvider>
          <App />
        </SalonProvider>
      </TRPCProvider>
    </BrowserRouter>
  </StrictMode>,
)
