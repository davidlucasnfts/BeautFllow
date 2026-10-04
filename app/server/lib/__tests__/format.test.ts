import { describe, expect, it } from "vitest";
import { capitalizeWords } from "../format";

describe("capitalizeWords", () => {
  it("capitaliza cada palavra", () => {
    expect(capitalizeWords("tinta para cabelo")).toBe("Tinta Para Cabelo");
  });

  it("normaliza caixa alta e baixa misturada", () => {
    expect(capitalizeWords("TINTA para Cabelo")).toBe("Tinta Para Cabelo");
  });

  it("remove espaços extras e bordas", () => {
    expect(capitalizeWords("  escova   progressiva ")).toBe("Escova Progressiva");
  });

  it("palavra única", () => {
    expect(capitalizeWords("descolorante")).toBe("Descolorante");
  });

  it("mantém números e medidas", () => {
    expect(capitalizeWords("pó descolorante 40g")).toBe("Pó Descolorante 40g");
  });
});
