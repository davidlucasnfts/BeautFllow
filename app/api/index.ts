/**
 * Vercel Serverless Entrypoint
 * ============================
 * Este arquivo é o ponto de entrada para as serverless functions do Vercel.
 * O frontend (SPA) é servido pelo CDN do Vercel a partir de dist/public.
 * As chamadas /api/* são redirecionadas para este handler pelo vercel.json.
 */

import { handle } from "hono/vercel";
import app from "./boot";

export const config = {
  runtime: "edge",
};

export default handle(app);
