import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import {
  createProfessional,
  getProfessionalsBySalon,
  getProfessionalById,
  updateProfessional,
} from "./queries/salon";
import { auditAction } from "./lib/audit";

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
    .mutation(async ({ input, ctx }) => {
      const { salonId, commissionRate, ...data } = input;
      const result = await createProfessional({
        salonId,
        ...data,
        commissionRate: String(commissionRate),
      });
      await auditAction("create", "professional", salonId, ctx.user?.id, result?.id ?? undefined, undefined, { name: data.name });
      return result;
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
    .mutation(async ({ input, ctx }) => {
      const { id, salonId, commissionRate, ...data } = input;
      const result = await updateProfessional(id, salonId, {
        ...data,
        ...(commissionRate !== undefined ? { commissionRate: String(commissionRate) } : {}),
      });
      await auditAction("update", "professional", salonId, ctx.user?.id, id, undefined, data);
      return result;
    }),
});
