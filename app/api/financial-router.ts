import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import {
  createFinancialRecord,
  getFinancialRecordsBySalon,
  getFinancialSummaryBySalon,
} from "./queries/salon";

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
    .query(({ input }) => getFinancialSummaryBySalon(input.salonId, input.month)),

  create: authedQuery
    .input(
      z.object({
        salonId: z.number(),
        appointmentId: z.number().optional(),
        clientId: z.number(),
        professionalId: z.number().optional(),
        type: z.enum(["service", "product", "package", "refund", "other"]).default("service"),
        description: z.string().min(1).max(255),
        amount: z.string().or(z.number()),
        commissionAmount: z.string().or(z.number()).optional(),
        paymentMethod: z.enum(["pix", "credit_card", "debit_card", "cash", "other"]).default("pix"),
        recordDate: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const { salonId, amount, commissionAmount, recordDate, ...data } = input;
      return createFinancialRecord({
        salonId,
        ...data,
        amount: String(amount),
        commissionAmount: commissionAmount ? String(commissionAmount) : "0.00",
        recordDate: recordDate,
      });
    }),
});
