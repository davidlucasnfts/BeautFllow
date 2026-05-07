import { authRouter } from "./auth-router";
import { localAuthRouter } from "./local-auth-router";
import { createRouter, publicQuery } from "./middleware";
import { salonRouter } from "./salon-router";
import { customerRouter } from "./client-router";
import { serviceRouter } from "./service-router";
import { professionalRouter } from "./professional-router";
import { appointmentRouter } from "./appointment-router";
import { financialRouter } from "./financial-router";
import { communicationRouter } from "./communication-router";
import { consentRouter } from "./consent-router";
import { dashboardRouter } from "./dashboard-router";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  localAuth: localAuthRouter,
  salon: salonRouter,
  customer: customerRouter,
  service: serviceRouter,
  professional: professionalRouter,
  appointment: appointmentRouter,
  financial: financialRouter,
  communication: communicationRouter,
  consent: consentRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
