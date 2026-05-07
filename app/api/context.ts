import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateLocalRequest } from "./local-auth-router";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };
  try {
    // Tenta auth local primeiro
    const localUser = await authenticateLocalRequest(opts.req.headers);
    if (localUser) {
      ctx.user = localUser as unknown as User;
    }
  } catch {
    // Authentication is optional here
  }
  return ctx;
}
