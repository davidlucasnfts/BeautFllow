// Lógica pura de estoque — testável sem banco (mesmo padrão de lib/booking.ts)

/** Aplica uma movimentação ao saldo atual e retorna o novo saldo
 *  (arredondado em 3 casas — coluna NUMERIC(10,3)). Pode retornar valor
 *  negativo; quem chama valida antes de gravar. */
export function applyMovement(
  current: number,
  type: "in" | "out",
  quantity: number
): number {
  const delta = type === "in" ? quantity : -quantity;
  return Math.round((current + delta) * 1000) / 1000;
}

/** Estoque baixo quando a quantidade atual atinge o mínimo configurado. */
export function isLowStock(quantity: number, minQuantity: number): boolean {
  return quantity <= minQuantity;
}
