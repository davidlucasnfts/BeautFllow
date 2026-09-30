import { describe, it, expect } from "vitest";
import { applyMovement, isLowStock } from "../stock";

describe("applyMovement", () => {
  it("entrada soma ao saldo", () => {
    expect(applyMovement(10, "in", 5)).toBe(15);
    expect(applyMovement(0, "in", 3.5)).toBe(3.5);
  });

  it("saída subtrai do saldo", () => {
    expect(applyMovement(10, "out", 4)).toBe(6);
    expect(applyMovement(2.5, "out", 0.5)).toBe(2);
  });

  it("pode ficar negativo — quem chama valida antes de gravar", () => {
    expect(applyMovement(2, "out", 5)).toBe(-3);
  });

  it("arredonda em 3 casas (coluna NUMERIC(10,3))", () => {
    expect(applyMovement(0.1, "in", 0.2)).toBe(0.3);
    expect(applyMovement(1, "out", 0.0004)).toBe(1);
  });
});

describe("isLowStock", () => {
  it("estoque baixo quando quantity <= minQuantity", () => {
    expect(isLowStock(5, 5)).toBe(true);
    expect(isLowStock(4, 5)).toBe(true);
    expect(isLowStock(6, 5)).toBe(false);
  });

  it("minQuantity 0: só alerta quando o saldo zera", () => {
    expect(isLowStock(0, 0)).toBe(true);
    expect(isLowStock(1, 0)).toBe(false);
  });
});
