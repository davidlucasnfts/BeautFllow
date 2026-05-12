import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { rateLimiter } from "hono-rate-limiter";
import * as Sentry from "@sentry/node";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { getDb } from "./queries/connection";

// Sentry — error tracking (só em produção)
if (env.isProduction && process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
  });
}

const app = new Hono<{ Bindings: HttpBindings }>();

// Headers de seguranca
app.use(secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'"],
  },
  xFrameOptions: "DENY",
  xContentTypeOptions: "nosniff",
  referrerPolicy: "strict-origin-when-cross-origin",
}));

// CORS — permite apenas origens conhecidas
app.use(cors({
  origin: env.isProduction
    ? ["https://beautyflow.vercel.app"]
    : ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
}));

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// Rate limiting — por IP (100 req/min) e por usuário autenticado (300 req/min)
const ipLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minuto
  limit: 100,
  standardHeaders: "draft-6",
  keyGenerator: (c) => c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown",
});

const authLimiter = rateLimiter({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: "draft-6",
  keyGenerator: (c) => {
    const auth = c.req.header("authorization") || "";
    return auth.slice(0, 50) || c.req.header("x-forwarded-for") || "unknown";
  },
});

app.use("/api/trpc/*", ipLimiter);
app.use("/api/trpc/localAuth.*", authLimiter);
app.use("/api/trpc/auth.*", authLimiter);

// Health check
app.get("/health", async (c) => {
  try {
    const db = getDb();
    await db.query.users.findFirst({ columns: { id: true } });
    return c.json({ status: "ok", db: "connected", ts: Date.now() }, 200);
  } catch {
    return c.json({ status: "error", db: "disconnected", ts: Date.now() }, 503);
  }
});

// tRPC handler
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
