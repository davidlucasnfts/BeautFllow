import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery } from "./middleware";
import {
  createAppointment,
  getAppointmentsBySalon,
  getAppointmentsByProfessional,
  getAppointmentById,
  getClientHistory,
  getServicesBySalon,
  getSalonById,
  getServiceById,
  getProfessionalById,
  createFinancialRecord,
  updateAppointment,
} from "./queries/salon";
import { parseAutoCheckoutSettings } from "@contracts/constants";
import { calcCommission } from "./lib/booking";
import { auditAction } from "./lib/audit";
import { assertSalonMember } from "./lib/tenant";
import {
  createFollowUpsFromAppointment,
  deleteFollowUpsForCancelledAppointment,
} from "./queries/followup";

/**
 * Monta o snapshot dos serviços adicionais do atendimento.
 * Só aceita serviços do próprio salão (inclusive inativos — um serviço pode
 * ter sido desativado entre o agendamento e a conclusão).
 */
async function buildExtraServicesSnapshot(salonId: number, ids: number[]) {
  if (ids.length === 0) return [];
  const salonServices = await getServicesBySalon(salonId, true);
  const byId = new Map(salonServices.map(s => [s.id, s]));
  return ids.map(id => {
    const service = byId.get(id);
    if (!service) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Serviço adicional inválido para este estabelecimento.",
      });
    }
    return {
      id: service.id,
      name: service.name,
      price: String(service.price),
      durationMinutes: service.durationMinutes,
    };
  });
}

export const appointmentRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        salonId: z.number(),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      await assertSalonMember(ctx.user.id, input.salonId);
      return getAppointmentsBySalon(
        input.salonId,
        input.fromDate,
        input.toDate
      );
    }),

  listByProfessional: authedQuery
    .input(
      z.object({
        salonId: z.number(),
        professionalId: z.number(),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      await assertSalonMember(ctx.user.id, input.salonId);
      return getAppointmentsByProfessional(
        input.salonId,
        input.professionalId,
        input.fromDate,
        input.toDate
      );
    }),

  byId: authedQuery
    .input(z.object({ id: z.number(), salonId: z.number() }))
    .query(async ({ input, ctx }) => {
      await assertSalonMember(ctx.user.id, input.salonId);
      return getAppointmentById(input.id, input.salonId);
    }),

  historyByClient: authedQuery
    .input(
      z.object({
        salonId: z.number(),
        clientId: z.number(),
        limit: z.number().min(1).max(20).default(5),
      })
    )
    .query(async ({ input, ctx }) => {
      await assertSalonMember(ctx.user.id, input.salonId);
      return getClientHistory(input.salonId, input.clientId, input.limit);
    }),

  create: authedQuery
    .input(
      z.object({
        salonId: z.number(),
        clientId: z.number(),
        professionalId: z.number(),
        serviceId: z.number(),
        appointmentDate: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        notes: z.string().optional(),
        source: z
          .enum(["online", "whatsapp", "phone", "walk_in", "staff"])
          .default("staff"),
        extraServiceIds: z.array(z.number()).max(10).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await assertSalonMember(ctx.user.id, input.salonId);
      const { salonId, extraServiceIds, ...data } = input;

      // Não permite agendar no passado (comparando em horário de Brasília)
      const nowBR = new Date(
        new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
      );
      const requestedStart = new Date(
        `${data.appointmentDate}T${data.startTime}:00`
      );
      if (requestedStart < nowBR) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Esse horário já passou. Escolha uma data futura.",
        });
      }

      const result = await createAppointment({
        salonId,
        ...data,
        appointmentDate: data.appointmentDate,
        extraServices: await buildExtraServicesSnapshot(
          salonId,
          extraServiceIds ?? []
        ),
        status: "scheduled",
      });
      await auditAction(
        "create",
        "appointment",
        salonId,
        ctx.user?.id,
        result?.id ?? undefined,
        undefined,
        { clientId: data.clientId, date: data.appointmentDate }
      );
      return result;
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        salonId: z.number(),
        clientId: z.number().optional(),
        professionalId: z.number().optional(),
        serviceId: z.number().optional(),
        appointmentDate: z.string().optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        notes: z.string().optional(),
        price: z.string().or(z.number()).optional(),
        extraServiceIds: z.array(z.number()).max(10).optional(),
        status: z
          .enum([
            "scheduled",
            "confirmed",
            "checked_in",
            "in_progress",
            "completed",
            "no_show",
            "cancelled",
          ])
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await assertSalonMember(ctx.user.id, input.salonId);
      const { id, salonId, price, appointmentDate, extraServiceIds, ...data } =
        input;
      const updateData: Record<string, unknown> = { ...data };
      if (price !== undefined) updateData.price = String(price);
      if (extraServiceIds !== undefined)
        updateData.extraServices = await buildExtraServicesSnapshot(
          salonId,
          extraServiceIds
        );
      if (appointmentDate !== undefined) updateData.appointmentDate = appointmentDate;
      if (data.status === "checked_in") updateData.checkedInAt = new Date();
      if (data.status === "completed") updateData.completedAt = new Date();
      if (data.status === "cancelled") updateData.cancelledAt = new Date();
      const result = await updateAppointment(id, salonId, updateData);
      // Ao concluir o atendimento, cria os retornos pendentes configurados
      // nos serviços (ex.: coloração → hidratação em 15 dias). Falha aqui
      // não pode impedir a conclusão do atendimento.
      if (data.status === "completed") {
        try {
          await createFollowUpsFromAppointment(id, salonId);
        } catch (e) {
          console.error("Falha ao criar retornos pós-atendimento:", e);
        }
      }
      // Agendamento cancelado → retorno vinculado deixa de existir
      if (data.status === "cancelled") {
        await deleteFollowUpsForCancelledAppointment(id, salonId);
      }
      await auditAction(
        "update",
        "appointment",
        salonId,
        ctx.user?.id,
        id,
        undefined,
        data
      );
      return result;
    }),

  // Fechamento automático (1 toque): cria o lançamento financeiro com a
  // comissão calculada e conclui o atendimento numa operação só. Usa os
  // padrões do salão (forma de pagamento) salvos em salons.settings.
  conclude: authedQuery
    .input(z.object({ id: z.number(), salonId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await assertSalonMember(ctx.user.id, input.salonId);
      const { id, salonId } = input;

      const appt = await getAppointmentById(id, salonId);
      if (!appt) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agendamento não encontrado.",
        });
      }
      if (appt.status !== "in_progress") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Só é possível concluir um atendimento em andamento.",
        });
      }

      const [salon, service, professional] = await Promise.all([
        getSalonById(salonId),
        getServiceById(appt.serviceId, salonId),
        appt.professionalId
          ? getProfessionalById(appt.professionalId, salonId)
          : Promise.resolve(null),
      ]);

      // Valor = preço do serviço (tabela) + extras registrados no agendamento
      // (mesmo cálculo do checkout manual)
      const extras = appt.extraServices ?? [];
      const extrasTotal = extras.reduce(
        (acc, e) => acc + Number(e.price),
        0
      );
      const amount = Number(
        (Number(service?.price ?? 0) + extrasTotal).toFixed(2)
      );
      if (amount <= 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Este atendimento não tem valor. Use 'Concluir com ajustes' para informar o valor.",
        });
      }

      // Comissão = % do profissional sobre o valor (antes sempre zerada)
      const rate = Number(professional?.commissionRate ?? 0);
      const commissionAmount = calcCommission(amount, rate);

      const { defaultPaymentMethod } = parseAutoCheckoutSettings(
        salon?.settings
      );

      const description = [service?.name, ...extras.map(e => e.name)]
        .filter(Boolean)
        .join(" + ");

      const record = await createFinancialRecord({
        salonId,
        appointmentId: appt.id,
        clientId: appt.clientId,
        professionalId: appt.professionalId,
        type: "service",
        description,
        amount: amount.toFixed(2),
        commissionAmount: commissionAmount.toFixed(2),
        paymentMethod: defaultPaymentMethod,
        recordDate: appt.appointmentDate,
      });
      await auditAction(
        "create",
        "financial",
        salonId,
        ctx.user?.id,
        record?.id ?? undefined,
        appt.clientId,
        { source: "auto-checkout", appointmentId: appt.id }
      );

      const result = await updateAppointment(id, salonId, {
        status: "completed",
        completedAt: new Date(),
      });
      // Retornos pós-atendimento (mesma regra do update manual) — falha
      // aqui não pode impedir a conclusão
      try {
        await createFollowUpsFromAppointment(id, salonId);
      } catch (e) {
        console.error("Falha ao criar retornos pós-atendimento:", e);
      }
      await auditAction(
        "update",
        "appointment",
        salonId,
        ctx.user?.id,
        id,
        undefined,
        { status: "completed", autoCheckout: true }
      );

      return {
        appointment: result,
        amount: amount.toFixed(2),
        commissionAmount: commissionAmount.toFixed(2),
      };
    }),
});
