import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import {
  createFinancialRecord,
  getFinancialRecordsBySalon,
  getFinancialSummaryBySalon,
  updateFinancialRecord,
  deleteFinancialRecord,
} from "./queries/salon";
import { auditAction } from "./lib/audit";

export const financialRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        salonId: z.number(),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
      })
    )
    .query(({ input }) =>
      getFinancialRecordsBySalon(input.salonId, input.fromDate, input.toDate)
    ),

  summary: authedQuery
    .input(z.object({ salonId: z.number(), month: z.string().optional() }))
    .query(({ input }) =>
      getFinancialSummaryBySalon(input.salonId, input.month)
    ),

  create: authedQuery
    .input(
      z.object({
        salonId: z.number(),
        appointmentId: z.number().optional(),
        clientId: z.number(),
        professionalId: z.number().optional(),
        type: z
          .enum(["service", "product", "package", "refund", "other"])
          .default("service"),
        description: z.string().min(1).max(255),
        amount: z.string().or(z.number()),
        commissionAmount: z.string().or(z.number()).optional(),
        paymentMethod: z
          .enum(["pix", "credit_card", "debit_card", "cash", "other"])
          .default("pix"),
        recordDate: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { salonId, amount, commissionAmount, recordDate, ...data } = input;
      const result = await createFinancialRecord({
        salonId,
        ...data,
        amount: String(amount),
        commissionAmount: commissionAmount ? String(commissionAmount) : "0.00",
        recordDate: recordDate,
      });
      await auditAction(
        "create",
        "financial_record",
        salonId,
        ctx.user?.id,
        result?.id ?? undefined,
        undefined,
        { amount: String(amount), type: data.type }
      );
      return result;
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        salonId: z.number(),
        amount: z.string().or(z.number()).optional(),
        description: z.string().min(1).max(255).optional(),
        paymentMethod: z
          .enum(["pix", "credit_card", "debit_card", "cash", "other"])
          .optional(),
        recordDate: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, salonId, amount, ...data } = input;
      const result = await updateFinancialRecord(id, salonId, {
        ...data,
        ...(amount !== undefined ? { amount: String(amount) } : {}),
      });
      await auditAction(
        "update",
        "financial_record",
        salonId,
        ctx.user?.id,
        id,
        undefined,
        {
          ...data,
          ...(amount !== undefined ? { amount: String(amount) } : {}),
        }
      );
      return result;
    }),

  delete: authedQuery
    .input(z.object({ id: z.number(), salonId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await deleteFinancialRecord(input.id, input.salonId);
      await auditAction(
        "delete",
        "financial_record",
        input.salonId,
        ctx.user?.id,
        input.id
      );
      return { success: true };
    }),
});
