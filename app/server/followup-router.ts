import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import {
  getPendingFollowUps,
  markFollowUpScheduled,
  dismissFollowUp,
} from "./queries/followup";
import { auditAction } from "./lib/audit";
import { assertSalonMember } from "./lib/tenant";

export const followupRouter = createRouter({
  list: authedQuery
    .input(z.object({ salonId: z.number() }))
    .query(async ({ input, ctx }) => {
      await assertSalonMember(ctx.user.id, input.salonId);
      return getPendingFollowUps(input.salonId);
    }),

  schedule: authedQuery
    .input(
      z.object({
        id: z.number(),
        salonId: z.number(),
        appointmentId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await assertSalonMember(ctx.user.id, input.salonId);
      await markFollowUpScheduled(input.id, input.salonId, input.appointmentId);
      await auditAction(
        "update",
        "client_follow_up",
        input.salonId,
        ctx.user?.id,
        input.id,
        undefined,
        { status: "scheduled", appointmentId: input.appointmentId }
      );
      return { success: true };
    }),

  dismiss: authedQuery
    .input(z.object({ id: z.number(), salonId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await assertSalonMember(ctx.user.id, input.salonId);
      await dismissFollowUp(input.id, input.salonId);
      await auditAction(
        "update",
        "client_follow_up",
        input.salonId,
        ctx.user?.id,
        input.id,
        undefined,
        { status: "dismissed" }
      );
      return { success: true };
    }),
});
