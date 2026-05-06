import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import {
  createProfessional,
  getProfessionalsBySalon,
  getProfessionalById,
  updateProfessional,
} from "./queries/salon";

export const professionalRouter = createRouter({
  list: authedQuery
    .input(z.object({ salonId: z.number() }))
    .query(({ input }) => getProfessionalsBySalon(input.salonId)),

  byId: authedQuery
    .input(z.object({ id: z.number(), salonId: z.number() }))
    .query(({ input }) => getProfessionalById(input.id, input.salonId)),

  create: authedQuery
    .input(
      z.object({
        salonId: z.number(),
        name: z.string().min(1).max(255),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().optional(),
        bio: z.string().optional(),
        commissionRate: z.string().or(z.number()).default("0.00"),
        color: z.string().default("#10b981"),
        workingHours: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const { salonId, commissionRate, ...data } = input;
      return createProfessional({
        salonId,
        ...data,
        commissionRate: String(commissionRate),
      });
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        salonId: z.number(),
        name: z.string().min(1).max(255).optional(),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().optional(),
        bio: z.string().optional(),
        commissionRate: z.string().or(z.number()).optional(),
        color: z.string().optional(),
        workingHours: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, salonId, commissionRate, ...data } = input;
      return updateProfessional(id, salonId, {
        ...data,
        ...(commissionRate !== undefined ? { commissionRate: String(commissionRate) } : {}),
      });
    }),
});
