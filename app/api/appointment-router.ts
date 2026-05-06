import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import {
  createAppointment,
  getAppointmentsBySalon,
  getAppointmentsByProfessional,
  getAppointmentById,
  updateAppointment,
} from "./queries/salon";

export const appointmentRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        salonId: z.number(),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
      })
    )
    .query(({ input }) =>
      getAppointmentsBySalon(input.salonId, input.fromDate, input.toDate)
    ),

  listByProfessional: authedQuery
    .input(
      z.object({
        salonId: z.number(),
        professionalId: z.number(),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
      })
    )
    .query(({ input }) =>
      getAppointmentsByProfessional(
        input.salonId,
        input.professionalId,
        input.fromDate,
        input.toDate
      )
    ),

  byId: authedQuery
    .input(z.object({ id: z.number(), salonId: z.number() }))
    .query(({ input }) => getAppointmentById(input.id, input.salonId)),

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
        source: z.enum(["online", "whatsapp", "phone", "walk_in", "staff"]).default("staff"),
      })
    )
    .mutation(({ input }) => {
      const { salonId, ...data } = input;
      return createAppointment({
        salonId,
        ...data,
        appointmentDate: data.appointmentDate,
        status: "scheduled",
      });
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
    .mutation(({ input }) => {
      const { id, salonId, price, appointmentDate, ...data } = input;
      const updateData: Record<string, unknown> = { ...data };
      if (price !== undefined) updateData.price = String(price);
      if (appointmentDate !== undefined) updateData.appointmentDate = new Date(appointmentDate);
      if (data.status === "checked_in") updateData.checkedInAt = new Date();
      if (data.status === "completed") updateData.completedAt = new Date();
      if (data.status === "cancelled") updateData.cancelledAt = new Date();
      return updateAppointment(id, salonId, updateData);
    }),
});
