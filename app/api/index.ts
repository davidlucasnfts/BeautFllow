/**
 * Vercel Serverless Entrypoint — Node.js Runtime
 * ==============================================
 * Edge Runtime não suporta bcryptjs, postgres, fs.
 * Usamos Node.js runtime para compatibilidade total.
 */

import { handle } from "@hono/node-server/vercel";
import app from "./boot";

export default handle(app);
