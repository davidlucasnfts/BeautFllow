import { z } from "zod";
import { TRPCError } from "@trpc/server";
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
import { capitalizeWords } from "./lib/format";

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
        name: z.string().min(1).max(255).transform(capitalizeWords),
        description: z.string().optional(),
        category: z.string().optional(),
        durationMinutes: z.number().min(1).max(1440),
        price: z.string().or(z.number()),
        color: z.string().default("#6366f1"),
        requiresConsent: z.boolean().default(false),
        preCareInstructions: z.string().optional(),
        postCareInstructions: z.string().optional(),
        followUpDays: z.number().int().min(0).max(365).default(0),
        followUpServiceId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await assertSalonMember(ctx.user.id, input.salonId);
      const { salonId, price, followUpServiceId, followUpDays, ...data } =
        input;
      // serviço do retorno precisa pertencer ao mesmo salão
      if (followUpServiceId) {
        const target = await getServiceById(followUpServiceId, salonId);
        if (!target) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Serviço de retorno inválido para este estabelecimento.",
          });
        }
      }
      const result = await createService({
        salonId,
        ...data,
        price: String(price),
        followUpDays,
        followUpServiceId: followUpServiceId ?? null,
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
        name: z.string().min(1).max(255).transform(capitalizeWords).optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        durationMinutes: z.number().min(1).max(1440).optional(),
        price: z.string().or(z.number()).optional(),
        color: z.string().optional(),
        requiresConsent: z.boolean().optional(),
        preCareInstructions: z.string().optional(),
        postCareInstructions: z.string().optional(),
        followUpDays: z.number().int().min(0).max(365).optional(),
        /** enviar null limpa o serviço de retorno */
        followUpServiceId: z.number().nullable().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await assertSalonMember(ctx.user.id, input.salonId);
      const { id, salonId, price, followUpServiceId, ...data } = input;
      if (followUpServiceId) {
        const target = await getServiceById(followUpServiceId, salonId);
        if (!target) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Serviço de retorno inválido para este estabelecimento.",
          });
        }
      }
      const result = await updateService(id, salonId, {
        ...data,
        ...(price !== undefined ? { price: String(price) } : {}),
        ...(followUpServiceId !== undefined ? { followUpServiceId } : {}),
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
