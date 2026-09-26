import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import {
  createService,
  getServicesBySalon,
  getServiceById,
  updateService,
  deleteService,
  reactivateService,
} from "./queries/salon";
import { auditAction } from "./lib/audit";
import { assertSalonMember } from "./lib/tenant";

export const serviceRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        salonId: z.number(),
        /** true = traz também inativos (excluídos logicamente) */
        includeInactive: z.boolean().default(false),
      })
    )
    .query(async ({ input, ctx }) => {
      await assertSalonMember(ctx.user.id, input.salonId);
      return getServicesBySalon(input.salonId, input.includeInactive);
    }),

  byId: authedQuery
    .input(z.object({ id: z.number(), salonId: z.number() }))
    .query(async ({ input, ctx }) => {
      await assertSalonMember(ctx.user.id, input.salonId);
      return getServiceById(input.id, input.salonId);
    }),

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
    .mutation(async ({ input, ctx }) => {
      await assertSalonMember(ctx.user.id, input.salonId);
      const { salonId, price, ...data } = input;
      const result = await createService({
        salonId,
        ...data,
        price: String(price),
      });
      await auditAction(
        "create",
        "service",
        salonId,
        ctx.user?.id,
        result?.id ?? undefined,
        undefined,
        { name: data.name }
      );
      return result;
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
    .mutation(async ({ input, ctx }) => {
      await assertSalonMember(ctx.user.id, input.salonId);
      const { id, salonId, price, ...data } = input;
      const result = await updateService(id, salonId, {
        ...data,
        ...(price !== undefined ? { price: String(price) } : {}),
      });
      await auditAction(
        "update",
        "service",
        salonId,
        ctx.user?.id,
        id,
        undefined,
        data
      );
      return result;
    }),

  delete: authedQuery
    .input(z.object({ id: z.number(), salonId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await assertSalonMember(ctx.user.id, input.salonId);
      await deleteService(input.id, input.salonId);
      await auditAction(
        "delete",
        "service",
        input.salonId,
        ctx.user?.id,
        input.id
      );
      return { success: true };
    }),

  reactivate: authedQuery
    .input(z.object({ id: z.number(), salonId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await assertSalonMember(ctx.user.id, input.salonId);
      await reactivateService(input.id, input.salonId);
      await auditAction(
        "update",
        "service",
        input.salonId,
        ctx.user?.id,
        input.id,
        undefined,
        { reactivated: true }
      );
      return { success: true };
    }),
});
