import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery } from "./middleware";
import {
  createProduct,
  getProductsBySalon,
  getProductById,
  updateProduct,
  deleteProduct,
  deactivateProduct,
  reactivateProduct,
  getProductsSummary,
  countMovementsByProduct,
  createStockMovement,
  getMovementsByProduct,
} from "./queries/product";
import { auditAction } from "./lib/audit";
import { assertSalonAdmin } from "./lib/tenant";
import { capitalizeWords } from "./lib/format";

export const productRouter = createRouter({
  list: authedQuery
    .input(
      z.object({
        salonId: z.number(),
        /** true = traz também inativos (excluídos logicamente) */
        includeInactive: z.boolean().default(false),
      })
    )
    .query(async ({ input, ctx }) => {
      await assertSalonAdmin(ctx.user.id, input.salonId);
      return getProductsBySalon(input.salonId, input.includeInactive);
    }),

  summary: authedQuery
    .input(z.object({ salonId: z.number() }))
    .query(async ({ input, ctx }) => {
      await assertSalonAdmin(ctx.user.id, input.salonId);
      return getProductsSummary(input.salonId);
    }),

  byId: authedQuery
    .input(z.object({ id: z.number(), salonId: z.number() }))
    .query(async ({ input, ctx }) => {
      await assertSalonAdmin(ctx.user.id, input.salonId);
      return getProductById(input.id, input.salonId);
    }),

  create: authedQuery
    .input(
      z.object({
        salonId: z.number(),
        name: z.string().min(1).max(255).transform(capitalizeWords),
        unit: z.string().min(1).max(20).default("un"),
        minQuantity: z.string().or(z.number()).default("0"),
        costPrice: z.string().or(z.number()).default("0"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await assertSalonAdmin(ctx.user.id, input.salonId);
      const { salonId, minQuantity, costPrice, ...data } = input;
      // saldo inicial sempre 0 — entrada dá-se por movimentação (RN: saldo
      // só muda no backend, aplicando a movimentação)
      const result = await createProduct({
        salonId,
        ...data,
        quantity: "0.000",
        minQuantity: String(minQuantity),
        costPrice: String(costPrice),
      });
      await auditAction(
        "create",
        "product",
        salonId,
        ctx.user?.id,
        result?.id ?? undefined,
        undefined,
        { name: data.name }
      );
      return result;
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        salonId: z.number(),
        name: z.string().min(1).max(255).transform(capitalizeWords).optional(),
        unit: z.string().min(1).max(20).optional(),
        minQuantity: z.string().or(z.number()).optional(),
        costPrice: z.string().or(z.number()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await assertSalonAdmin(ctx.user.id, input.salonId);
      const { id, salonId, minQuantity, costPrice, ...data } = input;
      const result = await updateProduct(id, salonId, {
        ...data,
        ...(minQuantity !== undefined ? { minQuantity: String(minQuantity) } : {}),
        ...(costPrice !== undefined ? { costPrice: String(costPrice) } : {}),
      });
      await auditAction("update", "product", salonId, ctx.user?.id, id, undefined, {
        ...data,
        ...(minQuantity !== undefined ? { minQuantity } : {}),
        ...(costPrice !== undefined ? { costPrice } : {}),
      });
      return result;
    }),

  /** Sem movimentações = exclusão física; com movimentações = inativa (soft delete) */
  delete: authedQuery
    .input(z.object({ id: z.number(), salonId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await assertSalonAdmin(ctx.user.id, input.salonId);
      const movements = await countMovementsByProduct(input.id, input.salonId);
      if (movements > 0) {
        await deactivateProduct(input.id, input.salonId);
      } else {
        await deleteProduct(input.id, input.salonId);
      }
      await auditAction(
        "delete",
        "product",
        input.salonId,
        ctx.user?.id,
        input.id,
        undefined,
        { mode: movements > 0 ? "soft" : "physical" }
      );
      return { success: true, softDeleted: movements > 0 };
    }),

  reactivate: authedQuery
    .input(z.object({ id: z.number(), salonId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await assertSalonAdmin(ctx.user.id, input.salonId);
      await reactivateProduct(input.id, input.salonId);
      await auditAction(
        "update",
        "product",
        input.salonId,
        ctx.user?.id,
        input.id,
        undefined,
        { reactivated: true }
      );
      return { success: true };
    }),

  /** Cria movimentação e aplica o saldo transacionalmente (nunca negativo) */
  movement: authedQuery
    .input(
      z.object({
        salonId: z.number(),
        productId: z.number(),
        type: z.enum(["in", "out"]),
        quantity: z.string().or(z.number()),
        reason: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await assertSalonAdmin(ctx.user.id, input.salonId);
      const { salonId, productId, type, quantity, reason } = input;
      const qty = Number(quantity);
      if (!Number.isFinite(qty) || qty <= 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Quantidade deve ser maior que zero.",
        });
      }
      const result = await createStockMovement({
        salonId,
        productId,
        type,
        quantity: qty.toFixed(3),
        reason: reason?.trim() ? reason.trim() : null,
      });
      await auditAction(
        "create",
        "stock_movement",
        salonId,
        ctx.user?.id,
        result?.id ?? undefined,
        undefined,
        { productId, type, quantity: qty, reason: reason ?? null }
      );
      return result;
    }),

  movements: authedQuery
    .input(z.object({ productId: z.number(), salonId: z.number() }))
    .query(async ({ input, ctx }) => {
      await assertSalonAdmin(ctx.user.id, input.salonId);
      return getMovementsByProduct(input.productId, input.salonId);
    }),
});
