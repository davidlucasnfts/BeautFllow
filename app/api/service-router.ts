import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import {
  createService,
  getServicesBySalon,
  getServiceById,
  updateService,
  deleteService,
} from "./queries/salon";

export const serviceRouter = createRouter({
  list: authedQuery
    .input(z.object({ salonId: z.number() }))
    .query(({ input }) => getServicesBySalon(input.salonId)),

  byId: authedQuery
    .input(z.object({ id: z.number(), salonId: z.number() }))
    .query(({ input }) => getServiceById(input.id, input.salonId)),

  create: authedQuery
    .input(
      z.object({
        salonId: z.number(),
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        category: z.string().optional(),
        durationMinutes: z.number().min(1).max(1440),
        price: z.string().or(z.number()),
        color: z.string().default("#6366f1"),
        requiresConsent: z.boolean().default(false),
        preCareInstructions: z.string().optional(),
        postCareInstructions: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const { salonId, price, ...data } = input;
      return createService({
        salonId,
        ...data,
        price: String(price),
      });
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        salonId: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        durationMinutes: z.number().min(1).max(1440).optional(),
        price: z.string().or(z.number()).optional(),
        color: z.string().optional(),
        requiresConsent: z.boolean().optional(),
        preCareInstructions: z.string().optional(),
        postCareInstructions: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, salonId, price, ...data } = input;
      return updateService(id, salonId, {
        ...data,
        ...(price !== undefined ? { price: String(price) } : {}),
      });
    }),

  delete: authedQuery
    .input(z.object({ id: z.number(), salonId: z.number() }))
    .mutation(({ input }) => deleteService(input.id, input.salonId)),
});
