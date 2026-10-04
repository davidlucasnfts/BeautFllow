import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import {
  getCommissionSummary,
  getCommissionPerformance,
  getProfessionalPayments,
  createProfessionalPayment,
  deleteProfessionalPayment,
} from "./queries/commission";
import { auditAction } from "./lib/audit";
import { assertSalonAdmin } from "./lib/tenant";

export const commissionRouter = createRouter({
  summary: authedQuery
    .input(
      z.object({
        salonId: z.number(),
        professionalId: z.number().optional(),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      await assertSalonAdmin(ctx.user.id, input.salonId);
      return getCommissionSummary(
        input.salonId,
        input.professionalId,
        input.fromDate,
        input.toDate
      );
    }),

  performance: authedQuery
    .input(
      z.object({
        salonId: z.number(),
        professionalId: z.number(),
        fromDate: z.string(),
        toDate: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      await assertSalonAdmin(ctx.user.id, input.salonId);
      return getCommissionPerformance(
        input.salonId,
        input.professionalId,
        input.fromDate,
        input.toDate
      );
    }),

  payments: authedQuery
    .input(
      z.object({
        salonId: z.number(),
        professionalId: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      await assertSalonAdmin(ctx.user.id, input.salonId);
      return getProfessionalPayments(
        input.salonId,
        input.professionalId
      );
    }),

  pay: authedQuery
    .input(
      z.object({
        salonId: z.number(),
        professionalId: z.number(),
        amount: z.string().or(z.number()),
        paymentMethod: z
          .enum(["pix", "credit_card", "debit_card", "cash", "other"])
          .default("pix"),
        paidAt: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await assertSalonAdmin(ctx.user.id, input.salonId);
      const { salonId, amount, ...data } = input;
      const result = await createProfessionalPayment({
        salonId,
        ...data,
        amount: String(amount),
      });
      await auditAction(
        "create",
        "professional_payment",
        salonId,
        ctx.user?.id,
        result?.id ?? undefined,
        undefined,
        {
          professionalId: data.professionalId,
          amount: String(amount),
        }
      );
      return result;
    }),

  deletePayment: authedQuery
    .input(z.object({ id: z.number(), salonId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await assertSalonAdmin(ctx.user.id, input.salonId);
      await deleteProfessionalPayment(input.id, input.salonId);
      await auditAction(
        "delete",
        "professional_payment",
        input.salonId,
        ctx.user?.id,
        input.id
      );
      return { success: true };
    }),
});
