import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import {
  createSalon,
  getSalonsByUser,
  addUserToSalon,
  updateSalon,
} from "./queries/salon";

export const salonRouter = createRouter({
  create: authedQuery
    .input(
      z.object({
        name: z.string().min(2).max(255),
        slug: z.string().min(2).max(255),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const salon = await createSalon({
        ...input,
        plan: "essential",
      });
      if (salon) {
        await addUserToSalon(salon.id, ctx.user.id, "owner");
      }
      return salon;
    }),

  list: authedQuery.query(async ({ ctx }) => {
    return getSalonsByUser(ctx.user.id);
  }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(2).max(255).optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return updateSalon(input.id, input);
    }),
});
