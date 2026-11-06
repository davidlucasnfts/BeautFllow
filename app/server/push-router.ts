import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getVapidPublicKey } from "./lib/push";
import {
  createPushSubscription,
  deletePushSubscription,
} from "./queries/push";
import { assertSalonMember } from "./lib/tenant";

export const pushRouter = createRouter({
  publicKey: authedQuery.query(() => {
    const key = getVapidPublicKey();
    if (key) {
      console.log("[push] VAPID_PUBLIC_KEY carregada, comprimento:", key.length);
    } else {
      console.log("[push] VAPID_PUBLIC_KEY não configurada");
    }
    return { publicKey: key ?? null };
  }),

  subscribe: authedQuery
    .input(
      z.object({
        salonId: z.number(),
        endpoint: z.string().url(),
        p256dh: z.string().min(1),
        auth: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await assertSalonMember(ctx.user.id, input.salonId);
      return createPushSubscription({
        salonId: input.salonId,
        userId: ctx.user.id,
        endpoint: input.endpoint,
        p256dh: input.p256dh,
        auth: input.auth,
      });
    }),

  unsubscribe: authedQuery
    .input(
      z.object({
        salonId: z.number(),
        endpoint: z.string().url(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await assertSalonMember(ctx.user.id, input.salonId);
      return deletePushSubscription(input.endpoint, ctx.user.id);
    }),
});
