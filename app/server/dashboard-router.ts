import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDashboardMetrics } from "./queries/salon";
import { assertSalonMember } from "./lib/tenant";

export const dashboardRouter = createRouter({
  metrics: authedQuery
    .input(z.object({ salonId: z.number(), month: z.string() }))
    .query(async ({ input, ctx }) => {
      await assertSalonMember(ctx.user.id, input.salonId);
      return getDashboardMetrics(input.salonId, input.month);
    }),
});
