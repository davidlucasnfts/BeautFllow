import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { TRPCError } from "@trpc/server";
import {
  parseScheduleSettings,
  parseThemeSettings,
  parseClientStatusSettings,
} from "@contracts/constants";
import { defaultThemeForSegment } from "@contracts/segment-palettes";
import {
  createSalon,
  getSalonsByUser,
  getSalonById,
  getSalonBySlug,
  addUserToSalon,
  updateSalon,
} from "./queries/salon";

const salonSegmentSchema = z.enum([
  "beauty_salon",
  "barbershop",
  "aesthetic_clinic",
]);

export const salonRouter = createRouter({
  create: authedQuery
    .input(
      z.object({
        name: z.string().min(2).max(255),
        slug: z.string().min(2).max(255),
        segment: salonSegmentSchema,
        phone: z.string().optional(),
        email: z.string().email().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { segment, ...rest } = input;
      const salon = await createSalon({
        ...rest,
        segment,
        plan: "essential",
      });
      if (salon) {
        await addUserToSalon(salon.id, ctx.user.id, "owner");
      }
      return salon;
    }),

  list: authedQuery.query(async ({ ctx }) => {
    const rows = await getSalonsByUser(ctx.user.id);
    return rows.map(({ salon, role }) => ({
      ...salon,
      role,
      schedule: parseScheduleSettings(salon.settings),
      theme:
        parseThemeSettings(salon.settings) ??
        defaultThemeForSegment(salon.segment).id,
      clientStatus: parseClientStatusSettings(salon.settings),
    }));
  }),

  updateSettings: authedQuery
    .input(
      z.object({
        id: z.number(),
        dayStart: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
        dayEnd: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
        slotMinutes: z.number().int().min(15).max(120),
        theme: z.string().optional(),
        clientStatus: z
          .object({
            mode: z.enum(["spent", "visits"]),
            vipThreshold: z.number().int().min(1).max(100000),
            atRiskDays: z.number().int().min(7).max(365),
            inactiveDays: z.number().int().min(15).max(730),
          })
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, theme, clientStatus, ...schedule } = input;
      // merge: preserva chaves desconhecidas já salvas em settings
      const current = await getSalonById(id);
      let existing: Record<string, unknown> = {};
      try {
        const parsed = current?.settings ? JSON.parse(current.settings) : null;
        if (parsed && typeof parsed === "object") existing = parsed;
      } catch {
        existing = {};
      }
      return updateSalon(id, {
        settings: JSON.stringify({
          ...existing,
          ...schedule,
          ...(theme ? { theme } : {}),
          ...(clientStatus ? { clientStatus } : {}),
        }),
      });
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(2).max(255).optional(),
        slug: z
          .string()
          .min(2)
          .max(255)
          .regex(
            /^[a-z0-9-]+$/,
            "Link inválido: use letras minúsculas, números e hífen"
          )
          .optional(),
        segment: salonSegmentSchema.optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, slug, ...rest } = input;
      if (slug) {
        const current = await getSalonById(id);
        if (current && current.slug !== slug) {
          const taken = await getSalonBySlug(slug);
          if (taken) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Este link já está em uso por outro negócio.",
            });
          }
        }
      }
      return updateSalon(id, { ...rest, ...(slug ? { slug } : {}) });
    }),
});
