import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import { parseScheduleSettings, parseThemeSettings } from "@contracts/constants";
import { defaultThemeForSegment } from "@contracts/segment-palettes";
import {
  getSalonBySlug,
  getPublicServices,
  getPublicProfessionals,
  getClientByPhone,
  getAppointmentsBySalon,
  createClient,
  updateClient,
  createAppointment,
} from "./queries/salon";
import { auditAction } from "./lib/audit";
import {
  addMinutes,
  floorToSlot,
  freeSlotsForAnyone,
  findFreeProfessional,
  type BusyAppointment,
} from "./lib/booking";

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
          theme:
            parseThemeSettings(salon.settings) ??
            defaultThemeForSegment(salon.segment).id,
          schedule: parseScheduleSettings(salon.settings),
        },
        services,
        professionals,
      };
    }),

  // Horários livres de um dia (grade de 30 em 30 min, menos os ocupados)
  availableSlots: publicQuery
    .input(
      z.object({
        slug: z.string().min(2).max(100),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        serviceId: z.number().int().positive(),
        professionalId: z.number().int().positive().optional(),
      })
    )
    .query(async ({ input }) => {
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

      const schedule = parseScheduleSettings(salon.settings);
      // "agora" no fuso de Brasília (mesma base das regras de antecedência)
      const nowBR = new Date(
        new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
      );
      const isoDay = (dt: Date) =>
        `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
      // dia fechado ou além da antecedência máxima: não gera slots
      const maxDate = new Date(nowBR);
      maxDate.setDate(maxDate.getDate() + schedule.maxAdvanceDays);
      const isWorkDay = schedule.workDays.includes(
        new Date(`${input.date}T12:00:00`).getDay()
      );
      if (!isWorkDay || input.date > isoDay(maxDate)) {
        return {
          slotMinutes: schedule.slotMinutes,
          dayStart: schedule.dayStart,
          dayEnd: schedule.dayEnd,
          busyIntervals: [],
          freeSlots: [],
        };
      }
      const [dayAppointments, professionals] = await Promise.all([
        getAppointmentsBySalon(salon.id, input.date, input.date),
        getPublicProfessionals(salon.id),
      ]);
      const busyIntervals = dayAppointments
        .filter(a => {
          if (a.status === "cancelled" || a.status === "no_show" || !a.endTime)
            return false;
          return input.professionalId
            ? a.professionalId === input.professionalId
            : a.professionalId === null;
        })
        .flatMap(a => {
          if (!a.endTime) return [];
          return [
            { start: floorToSlot(a.startTime, schedule.slotMinutes), end: a.endTime },
          ];
        });

      // "Sem preferência": um slot só é livre se ALGUM profissional ativo
      // estiver livre no intervalo — evita overbooking entre clientes que
      // escolhem profissional e clientes que não escolhem
      let freeSlots: string[] | undefined;
      if (!input.professionalId && professionals.length > 0) {
        freeSlots = freeSlotsForAnyone(
          professionals,
          dayAppointments as BusyAppointment[],
          schedule,
          service.durationMinutes
        );
      }

      // regras do estabelecimento: antecedência mínima e pausa/almoço
      // (no fluxo com profissional escolhido quem filtra é o frontend,
      //  com os mesmos dados do bookingPage)
      const minStart = new Date(
        nowBR.getTime() + schedule.minAdvanceMinutes * 60_000
      );
      const blockedByRules = (slot: string) => {
        const start = new Date(`${input.date}T${slot}:00`);
        if (start < minStart) return true;
        if (
          schedule.breakStart &&
          schedule.breakEnd &&
          slot >= schedule.breakStart &&
          slot < schedule.breakEnd
        ) {
          return true;
        }
        return false;
      };
      if (freeSlots) freeSlots = freeSlots.filter(s => !blockedByRules(s));

      return {
        slotMinutes: schedule.slotMinutes,
        dayStart: schedule.dayStart,
        dayEnd: schedule.dayEnd,
        busyIntervals,
        freeSlots,
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

      // Regras do agendamento online (dias, antecedência, pausa, pausa geral)
      const schedule = parseScheduleSettings(salon.settings);
      if (schedule.onlineBookingPaused) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Agendamento online temporariamente pausado. Entre em contato com o estabelecimento pelo WhatsApp.",
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

      const professionals = await getPublicProfessionals(salon.id);
      if (
        input.professionalId &&
        !professionals.find(p => p.id === input.professionalId)
      ) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profissional não encontrado.",
        });
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
      // Revalida as regras (o cliente pode ter aberto a página antes delas mudarem)
      const isoDay = (dt: Date) =>
        `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
      if (
        !schedule.workDays.includes(
          new Date(`${input.date}T12:00:00`).getDay()
        )
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Não atendemos neste dia da semana. Escolha outra data.",
        });
      }
      const maxDate = new Date(nowBR);
      maxDate.setDate(maxDate.getDate() + schedule.maxAdvanceDays);
      if (input.date > isoDay(maxDate)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Só é possível agendar com até ${schedule.maxAdvanceDays} dias de antecedência.`,
        });
      }
      const minStart = new Date(
        nowBR.getTime() + schedule.minAdvanceMinutes * 60_000
      );
      if (requestedStart < minStart) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `É preciso agendar com pelo menos ${schedule.minAdvanceMinutes} minutos de antecedência.`,
        });
      }
      if (
        schedule.breakStart &&
        schedule.breakEnd &&
        input.startTime >= schedule.breakStart &&
        input.startTime < schedule.breakEnd
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Este horário está no intervalo de pausa do estabelecimento.",
        });
      }

      // Conflito de horário: bloqueia sobreposição no profissional escolhido.
      // Sem preferência: atribui automaticamente o primeiro profissional livre
      // (se nenhum estiver livre, o horário está cheio — evita overbooking)
      const newEnd = addMinutes(input.startTime, service.durationMinutes);
      const dayAppointments = await getAppointmentsBySalon(
        salon.id,
        input.date,
        input.date
      );

      let assignedProfessionalId = input.professionalId ?? null;
      if (input.professionalId) {
        const conflict = dayAppointments.find(a => {
          if (
            a.status === "cancelled" ||
            a.status === "no_show" ||
            !a.endTime
          )
            return false;
          if (a.professionalId !== input.professionalId) return false;
          return a.startTime < newEnd && a.endTime > input.startTime;
        });
        if (conflict) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Esse horário já está ocupado. Escolha outro horário.",
          });
        }
      } else if (professionals.length > 0) {
        const free = findFreeProfessional(
          professionals,
          dayAppointments as BusyAppointment[],
          input.startTime,
          newEnd
        );
        if (!free) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Esse horário já está ocupado. Escolha outro horário.",
          });
        }
        assignedProfessionalId = free.id;
      }

      // Cliente já existe (pelo telefone)? Reutiliza. Se não, cria.
      // Em ambos os casos o aceite LGPD do formulário público é registrado
      let client = await getClientByPhone(salon.id, input.phone);
      if (!client) {
        client = await createClient({
          salonId: salon.id,
          name: input.name,
          phone: input.phone,
          consentGiven: true,
          consentGivenAt: new Date(),
        });
      } else if (!client.consentGiven) {
        client = await updateClient(client.id, salon.id, {
          consentGiven: true,
          consentGivenAt: new Date(),
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
        professionalId: assignedProfessionalId,
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
