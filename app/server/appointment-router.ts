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
  updateAppointment,
} from "./queries/salon";
import { auditAction } from "./lib/audit";
import { assertSalonMember } from "./lib/tenant";
import { createFollowUpsFromAppointment } from "./queries/followup";

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
      if (appointmentDate !== undefined)
        updateData.appointmentDate = new Date(appointmentDate);
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
});
