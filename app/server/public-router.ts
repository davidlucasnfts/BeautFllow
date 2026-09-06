import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import {
  getSalonBySlug,
  getPublicServices,
  getPublicProfessionals,
  getClientByPhone,
  getAppointmentsBySalon,
  createClient,
  createAppointment,
} from "./queries/salon";
import { auditAction } from "./lib/audit";

function addMinutes(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = (h * 60 + m + minutes) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(
    total % 60
  ).padStart(2, "0")}`;
}

const phoneSchema = z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, {
  message: "Telefone inválido. Use o formato (99) 99999-9999.",
});

export const publicRouter = createRouter({
  // Dados da página pública de agendamento (sem login)
  bookingPage: publicQuery
    .input(z.object({ slug: z.string().min(2).max(100) }))
    .query(async ({ input }) => {
      const salon = await getSalonBySlug(input.slug);
      if (!salon) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Endereço não encontrado.",
        });
      }
      const [services, professionals] = await Promise.all([
        getPublicServices(salon.id),
        getPublicProfessionals(salon.id),
      ]);
      return {
        salon: {
          name: salon.name,
          slug: salon.slug,
          segment: salon.segment,
          address: salon.address,
          city: salon.city,
          state: salon.state,
          phone: salon.phone,
        },
        services,
        professionals,
      };
    }),

  // Cria o agendamento vindo do link público
  book: publicQuery
    .input(
      z.object({
        slug: z.string().min(2).max(100),
        name: z.string().min(2).max(255),
        phone: phoneSchema,
        serviceId: z.number().int().positive(),
        professionalId: z.number().int().positive().optional(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        startTime: z
          .string()
          .regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
            message: "Horário inválido.",
          }),
        notes: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const salon = await getSalonBySlug(input.slug);
      if (!salon) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Endereço não encontrado.",
        });
      }

      const services = await getPublicServices(salon.id);
      const service = services.find(s => s.id === input.serviceId);
      if (!service) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Serviço não encontrado.",
        });
      }

      if (input.professionalId) {
        const professionals = await getPublicProfessionals(salon.id);
        if (!professionals.find(p => p.id === input.professionalId)) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Profissional não encontrado.",
          });
        }
      }

      // Não permite agendar no passado (comparando em horário de Brasília)
      const nowBR = new Date(
        new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
      );
      const requestedStart = new Date(`${input.date}T${input.startTime}:00`);
      if (requestedStart < nowBR) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Esse horário já passou. Escolha uma data futura.",
        });
      }

      // Conflito de horário: bloqueia sobreposição no mesmo profissional
      // (ou entre agendamentos sem profissional definido)
      const newEnd = addMinutes(input.startTime, service.durationMinutes);
      const dayAppointments = await getAppointmentsBySalon(
        salon.id,
        input.date,
        input.date
      );
      const conflict = dayAppointments.find(a => {
        if (a.status === "cancelled" || a.status === "no_show") return false;
        const sameProfessional = input.professionalId
          ? a.professionalId === input.professionalId
          : a.professionalId === null;
        if (!sameProfessional || !a.endTime) return false;
        return a.startTime < newEnd && a.endTime > input.startTime;
      });
      if (conflict) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Esse horário já está ocupado. Escolha outro horário.",
        });
      }

      // Cliente já existe (pelo telefone)? Reutiliza. Se não, cria.
      let client = await getClientByPhone(salon.id, input.phone);
      if (!client) {
        client = await createClient({
          salonId: salon.id,
          name: input.name,
          phone: input.phone,
        });
      }
      if (!client) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Não foi possível registrar seu cadastro.",
        });
      }

      const appointment = await createAppointment({
        salonId: salon.id,
        clientId: client.id,
        serviceId: service.id,
        professionalId: input.professionalId ?? null,
        appointmentDate: input.date,
        startTime: input.startTime,
        endTime: addMinutes(input.startTime, service.durationMinutes),
        notes: input.notes ?? null,
        source: "online",
        status: "scheduled",
      });

      await auditAction(
        "create",
        "appointment",
        salon.id,
        undefined,
        appointment?.id ?? undefined,
        undefined,
        { source: "online", clientId: client.id }
      );

      return {
        salonName: salon.name,
        serviceName: service.name,
        date: input.date,
        startTime: input.startTime,
        endTime: addMinutes(input.startTime, service.durationMinutes),
        clientName: client.name,
      };
    }),
});
