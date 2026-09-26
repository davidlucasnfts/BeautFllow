import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery } from "./middleware";
import {
  createConsentForm,
  getConsentFormsBySalon,
  getConsentFormById,
  updateConsentForm,
  deleteConsentForm,
  createConsentSignature,
  getConsentSignaturesByClient,
} from "./queries/salon";
import { auditAction } from "./lib/audit";
import { assertSalonMember } from "./lib/tenant";

export const consentRouter = createRouter({
  list: authedQuery
    .input(z.object({ salonId: z.number() }))
    .query(async ({ input, ctx }) => {
      await assertSalonMember(ctx.user.id, input.salonId);
      return getConsentFormsBySalon(input.salonId);
    }),

  byId: authedQuery
    .input(z.object({ id: z.number(), salonId: z.number() }))
    .query(async ({ input, ctx }) => {
      await assertSalonMember(ctx.user.id, input.salonId);
      return getConsentFormById(input.id, input.salonId);
    }),

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
      await assertSalonMember(ctx.user.id, input.salonId);
      const result = await createConsentForm(input);
      await auditAction(
        "create",
        "consent_form",
        input.salonId,
        ctx.user?.id,
        result?.id ?? undefined,
        undefined,
        { title: input.title }
      );
      return result;
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        salonId: z.number(),
        title: z.string().min(1).max(255).optional(),
        content: z.string().min(1).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await assertSalonMember(ctx.user.id, input.salonId);
      const { id, salonId, ...data } = input;
      const result = await updateConsentForm(id, salonId, data);
      await auditAction(
        "update",
        "consent_form",
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
      await deleteConsentForm(input.id, input.salonId);
      await auditAction(
        "delete",
        "consent_form",
        input.salonId,
        ctx.user?.id,
        input.id
      );
      return { success: true };
    }),

  signaturesByClient: authedQuery
    .input(z.object({ clientId: z.number(), salonId: z.number() }))
    .query(async ({ input, ctx }) => {
      await assertSalonMember(ctx.user.id, input.salonId);
      return getConsentSignaturesByClient(input.clientId, input.salonId);
    }),

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
      await assertSalonMember(ctx.user.id, input.salonId);
      // trava server-side: termo inativo (excluído, histórico LGPD) não aceita assinatura
      const form = await getConsentFormById(input.formId, input.salonId);
      if (!form || !form.isActive) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Termo não encontrado.",
        });
      }
      const result = await createConsentSignature(input);
      await auditAction(
        "create",
        "consent_signature",
        input.salonId,
        ctx.user?.id,
        result?.id ?? undefined,
        undefined,
        { clientId: input.clientId, formId: input.formId }
      );
      return result;
    }),
});
