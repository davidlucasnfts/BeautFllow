import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDashboardMetrics } from "./queries/salon";

export const dashboardRouter = createRouter({
  metrics: authedQuery
    .input(z.object({ salonId: z.number(), month: z.string() }))
    .query(({ input }) => getDashboardMetrics(input.salonId, input.month)),
});
