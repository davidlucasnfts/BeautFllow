import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import {
  createCommunication,
  getCommunicationsByClient,
  getCommunicationsBySalon,
} from "./queries/salon";

export const communicationRouter = createRouter({
  listByClient: authedQuery
    .input(z.object({ clientId: z.number(), salonId: z.number() }))
    .query(({ input }) => getCommunicationsByClient(input.clientId, input.salonId)),

  listBySalon: authedQuery
    .input(z.object({ salonId: z.number(), limit: z.number().default(50) }))
    .query(({ input }) => getCommunicationsBySalon(input.salonId, input.limit)),

  create: authedQuery
    .input(
      z.object({
        salonId: z.number(),
        clientId: z.number(),
        appointmentId: z.number().optional(),
        channel: z.enum(["whatsapp", "sms", "email", "phone", "in_app"]).default("whatsapp"),
        direction: z.enum(["outbound", "inbound"]).default("outbound"),
        type: z.enum([
          "confirmation",
          "reminder",
          "check_in",
          "post_care",
          "reactivation",
          "campaign",
          "manual",
        ]).default("manual"),
        content: z.string().min(1),
        status: z.enum(["pending", "sent", "delivered", "read", "failed"]).default("sent"),
      })
    )
    .mutation(({ input }) =>
      createCommunication({
        ...input,
        sentAt: input.status === "sent" ? new Date() : undefined,
      })
    ),
});
