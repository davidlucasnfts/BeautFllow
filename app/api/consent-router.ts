import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import {
  createConsentForm,
  getConsentFormsBySalon,
  getConsentFormById,
  createConsentSignature,
  getConsentSignaturesByClient,
} from "./queries/salon";
import { auditAction } from "./lib/audit";

export const consentRouter = createRouter({
  list: authedQuery
    .input(z.object({ salonId: z.number() }))
    .query(({ input }) => getConsentFormsBySalon(input.salonId)),

  byId: authedQuery
    .input(z.object({ id: z.number(), salonId: z.number() }))
    .query(({ input }) => getConsentFormById(input.id, input.salonId)),

  create: authedQuery
    .input(
      z.object({
        salonId: z.number(),
        title: z.string().min(1).max(255),
        content: z.string().min(1),
        serviceId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await createConsentForm(input);
      await auditAction("create", "consent_form", input.salonId, ctx.user?.id, result?.id ?? undefined, undefined, { title: input.title });
      return result;
    }),

  signaturesByClient: authedQuery
    .input(z.object({ clientId: z.number(), salonId: z.number() }))
    .query(({ input }) => getConsentSignaturesByClient(input.clientId, input.salonId)),

  sign: authedQuery
    .input(
      z.object({
        salonId: z.number(),
        formId: z.number(),
        clientId: z.number(),
        appointmentId: z.number().optional(),
        signatureData: z.string().optional(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await createConsentSignature(input);
      await auditAction("create", "consent_signature", input.salonId, ctx.user?.id, result?.id ?? undefined, undefined, { clientId: input.clientId, formId: input.formId });
      return result;
    }),
});
