import { describe, it, expect } from "vitest";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return phone;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

describe("utils", () => {
  describe("formatCurrency", () => {
    it("deve formatar reais corretamente", () => {
      expect(formatCurrency(100)).toBe("R$\u00a0100,00");
    });

    it("deve formatar centavos", () => {
      expect(formatCurrency(0.5)).toBe("R$\u00a00,50");
    });

    it("deve formatar milhares", () => {
      expect(formatCurrency(1500.99)).toBe("R$\u00a01.500,99");
    });
  });

  describe("formatPhone", () => {
    it("deve formatar celular com 9 dígitos", () => {
      expect(formatPhone("11999998888")).toBe("(11) 99999-8888");
    });

    it("deve formatar telefone fixo", () => {
      expect(formatPhone("1133334444")).toBe("(11) 3333-4444");
    });

    it("deve manter formato inválido", () => {
      expect(formatPhone("123")).toBe("123");
    });
  });

  describe("truncateText", () => {
    it("deve truncar texto longo", () => {
      expect(truncateText("texto muito longo", 5)).toBe("texto...");
    });

    it("deve manter texto curto", () => {
      expect(truncateText("curto", 10)).toBe("curto");
    });
  });
});
