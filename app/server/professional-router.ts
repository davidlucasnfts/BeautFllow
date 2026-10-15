import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import {
  createProfessional,
  getProfessionalsBySalon,
  getProfessionalById,
  updateProfessional,
  deleteProfessional,
  reactivateProfessional,
} from "./queries/salon";
import { auditAction } from "./lib/audit";
import { assertSalonAdmin } from "./lib/tenant";
import { capitalizeWords } from "./lib/format";

/** Paleta rotativa das cores de profissional na agenda (ordem = sequência
 *  de contratação). Atribuída automaticamente — sem configuração manual. */
const PROFESSIONAL_COLORS = [
  "#8B5CF6", // violeta
  "#10B981", // esmeralda
  "#F59E0B", // âmbar
  "#3B82F6", // azul
  "#EC4899", // rosa
  "#14B8A6", // turquesa
  "#F97316", // laranja
  "#6366F1", // índigo
];

export const professionalRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        salonId: z.number(),
        /** true = traz também inativos (excluídos logicamente) */
        includeInactive: z.boolean().default(false),
      })
    )
    .query(async ({ input, ctx }) => {
      await assertSalonAdmin(ctx.user.id, input.salonId);
      return getProfessionalsBySalon(input.salonId, input.includeInactive);
    }),

  byId: authedQuery
    .input(z.object({ id: z.number(), salonId: z.number() }))
    .query(async ({ input, ctx }) => {
      await assertSalonAdmin(ctx.user.id, input.salonId);
      return getProfessionalById(input.id, input.salonId);
    }),

  create: authedQuery
    .input(
      z.object({
        salonId: z.number(),
        name: z.string().min(1).max(255).transform(capitalizeWords),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().optional(),
        bio: z.string().optional(),
        commissionRate: z.string().or(z.number()).default("0.00"),
        color: z.string().optional(),
        workingHours: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await assertSalonAdmin(ctx.user.id, input.salonId);
      const { salonId, commissionRate, ...data } = input;
      // cor automática: próxima da paleta rotativa conforme o tamanho da equipe
      const team = await getProfessionalsBySalon(salonId, true);
      const color =
        data.color ?? PROFESSIONAL_COLORS[team.length % PROFESSIONAL_COLORS.length];
      const result = await createProfessional({
        salonId,
        ...data,
        color,
        commissionRate: String(commissionRate),
      });
      await auditAction(
        "create",
        "professional",
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
      await assertSalonAdmin(ctx.user.id, input.salonId);
      const { id, salonId, commissionRate, ...data } = input;
      const result = await updateProfessional(id, salonId, {
        ...data,
        ...(commissionRate !== undefined
          ? { commissionRate: String(commissionRate) }
          : {}),
      });
      await auditAction(
        "update",
        "professional",
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
      await assertSalonAdmin(ctx.user.id, input.salonId);
      await deleteProfessional(input.id, input.salonId);
      await auditAction(
        "delete",
        "professional",
        input.salonId,
        ctx.user?.id,
        input.id
      );
      return { success: true };
    }),

  reactivate: authedQuery
    .input(z.object({ id: z.number(), salonId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await assertSalonAdmin(ctx.user.id, input.salonId);
      await reactivateProfessional(input.id, input.salonId);
      await auditAction(
        "update",
        "professional",
        input.salonId,
        ctx.user?.id,
        input.id,
        undefined,
        { reactivated: true }
      );
      return { success: true };
    }),
});
