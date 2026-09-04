/**
 * Vercel Serverless Entrypoint — Node.js Runtime
 * Fonte usada pelo build para gerar api/index.js (a Vercel nao compila TS aqui).
 */

import { handle } from "@hono/node-server/vercel";
import app from "./boot";

export default handle(app);
