import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import {
  createClient,
  getClientsBySalon,
  getClientById,
  updateClient,
  deleteClient,
  searchClients,
} from "./queries/salon";
import { auditAction } from "./lib/audit";

export const customerRouter = createRouter({
  list: authedQuery
    .input(z.object({ salonId: z.number(), limit: z.number().default(100) }))
    .query(({ input }) => getClientsBySalon(input.salonId, input.limit)),

  byId: authedQuery
    .input(z.object({ id: z.number(), salonId: z.number() }))
    .query(({ input }) => getClientById(input.id, input.salonId)),

  search: authedQuery
    .input(z.object({ salonId: z.number(), query: z.string() }))
    .query(({ input }) => searchClients(input.salonId, input.query)),

  create: authedQuery
    .input(
      z.object({
        salonId: z.number(),
        name: z.string().min(1).max(255),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().min(1).max(50),
        birthDate: z.string().optional(),
        cpf: z.string().optional(),
        notes: z.string().optional(),
        tags: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { salonId, ...data } = input;
      const result = await createClient({
        salonId,
        ...data,
        birthDate: data.birthDate || null,
        segment: "new",
      });
      await auditAction("create", "client", salonId, ctx.user?.id, result?.id ?? undefined, undefined, { name: data.name });
      return result;
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        salonId: z.number(),
        name: z.string().min(1).max(255).optional(),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().min(1).max(50).optional(),
        birthDate: z.string().optional(),
        cpf: z.string().optional(),
        notes: z.string().optional(),
        tags: z.string().optional(),
        segment: z.enum(["new", "active", "vip", "at_risk", "inactive"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, salonId, birthDate, ...data } = input;
      const result = await updateClient(id, salonId, {
        ...data,
        birthDate: birthDate || undefined,
      });
      await auditAction("update", "client", salonId, ctx.user?.id, id, undefined, data);
      return result;
    }),

  delete: authedQuery
    .input(z.object({ id: z.number(), salonId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await deleteClient(input.id, input.salonId);
      await auditAction("delete", "client", input.salonId, ctx.user?.id, input.id);
      return { success: true };
    }),
});
