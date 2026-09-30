import { and, desc, eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getDb } from "./connection";
import { products, stockMovements } from "@db/schema";
import type { InsertProduct, InsertStockMovement } from "@db/schema";
import { applyMovement } from "../lib/stock";

// ==========================================
// Products
// ==========================================
export async function createProduct(data: InsertProduct) {
  const db = getDb();
  const [{ id }] = await db.insert(products).values(data).returning();
  return db.query.products.findFirst({ where: eq(products.id, id) });
}

export async function getProductsBySalon(
  salonId: number,
  includeInactive = false
) {
  return getDb()
    .select()
    .from(products)
    .where(
      includeInactive
        ? eq(products.salonId, salonId)
        : and(eq(products.salonId, salonId), eq(products.isActive, true))
    )
    .orderBy(products.name);
}

export async function getProductById(id: number, salonId: number) {
  return getDb().query.products.findFirst({
    where: and(eq(products.id, id), eq(products.salonId, salonId)),
  });
}

export async function updateProduct(
  id: number,
  salonId: number,
  data: Partial<InsertProduct>
) {
  await getDb()
    .update(products)
    .set(data)
    .where(and(eq(products.id, id), eq(products.salonId, salonId)));
  return getProductById(id, salonId);
}

/** Exclusão física — só permitida para produtos sem movimentações (router valida) */
export async function deleteProduct(id: number, salonId: number) {
  await getDb()
    .delete(products)
    .where(and(eq(products.id, id), eq(products.salonId, salonId)));
}

/** Exclusão lógica — produto com movimentações fica inativo (histórico preservado) */
export async function deactivateProduct(id: number, salonId: number) {
  await getDb()
    .update(products)
    .set({ isActive: false })
    .where(and(eq(products.id, id), eq(products.salonId, salonId)));
}

/** Reativa um produto inativado por engano (exclusão é lógica) */
export async function reactivateProduct(id: number, salonId: number) {
  await getDb()
    .update(products)
    .set({ isActive: true })
    .where(and(eq(products.id, id), eq(products.salonId, salonId)));
}

/** Resumo do topo da página: valor investido e alertas de estoque baixo */
export async function getProductsSummary(salonId: number) {
  const [row] = await getDb()
    .select({
      totalInvested: sql<string>`COALESCE(SUM(${products.quantity} * ${products.costPrice}), 0)`,
      activeCount: sql<number>`COUNT(*) FILTER (WHERE ${products.isActive} = true)`,
      lowStockCount: sql<number>`COUNT(*) FILTER (WHERE ${products.isActive} = true AND ${products.quantity} <= ${products.minQuantity})`,
    })
    .from(products)
    .where(eq(products.salonId, salonId));

  // SUM/COUNT do Postgres voltam como string (numeric) — normalizar p/ número
  return {
    totalInvested: Number(row?.totalInvested ?? 0),
    activeCount: Number(row?.activeCount ?? 0),
    lowStockCount: Number(row?.lowStockCount ?? 0),
  };
}

// ==========================================
// Stock Movements
// ==========================================
export async function countMovementsByProduct(
  productId: number,
  salonId: number
) {
  const [row] = await getDb()
    .select({ count: sql<number>`COUNT(*)` })
    .from(stockMovements)
    .where(
      and(
        eq(stockMovements.productId, productId),
        eq(stockMovements.salonId, salonId)
      )
    );
  return Number(row?.count ?? 0);
}

/** Cria a movimentação e aplica o saldo no produto ATOMICAMENTE (transação).
 *  Saída nunca deixa o saldo negativo — erro claro em português. */
export async function createStockMovement(data: InsertStockMovement) {
  const db = getDb();
  return db.transaction(async tx => {
    const product = await tx.query.products.findFirst({
      where: and(
        eq(products.id, data.productId),
        eq(products.salonId, data.salonId)
      ),
    });
    if (!product) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Produto não encontrado.",
      });
    }
    const next = applyMovement(
      Number(product.quantity),
      data.type,
      Number(data.quantity)
    );
    if (next < 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Saldo insuficiente: ${Number(product.quantity)} ${product.unit} em estoque.`,
      });
    }
    await tx
      .update(products)
      .set({ quantity: next.toFixed(3) })
      .where(eq(products.id, product.id));
    const [{ id }] = await tx.insert(stockMovements).values(data).returning();
    return tx.query.stockMovements.findFirst({ where: eq(stockMovements.id, id) });
  });
}

/** Histórico de movimentações do produto (data formatada no fuso de SP) */
export async function getMovementsByProduct(productId: number, salonId: number) {
  return getDb()
    .select({
      id: stockMovements.id,
      type: stockMovements.type,
      quantity: stockMovements.quantity,
      reason: stockMovements.reason,
      // timestamp gravado em UTC — formatar no servidor com o fuso do Brasil
      createdAt: sql<string>`TO_CHAR(${stockMovements.createdAt} AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI')`,
    })
    .from(stockMovements)
    .where(
      and(
        eq(stockMovements.productId, productId),
        eq(stockMovements.salonId, salonId)
      )
    )
    .orderBy(desc(stockMovements.createdAt))
    .limit(100);
}
