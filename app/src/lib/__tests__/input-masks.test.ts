import { describe, it, expect } from "vitest";
import {
  onlyDigits,
  onlyText,
  maskPhoneBR,
  maskDateBR,
  isValidDateBR,
  dateBRToISO,
  isoToDateBR,
  maskMoneyBR,
  moneyBRToDot,
  moneyDotToBR,
  maskSlug,
} from "../input-masks";

describe("onlyDigits", () => {
  it("remove tudo que não é dígito", () => {
    expect(onlyDigits("(11) 9aaaa9999-9999")).toBe("11999999999");
  });
});

describe("onlyText", () => {
  it("remove dígitos de nomes de pessoas", () => {
    expect(onlyText("Maria123 Silva")).toBe("Maria Silva");
  });
  it("mantém acentos e apóstrofos", () => {
    expect(onlyText("Ana Vitória d'Ávila")).toBe("Ana Vitória d'Ávila");
  });
  it("permite dígitos quando solicitado (nome de negócio)", () => {
    expect(onlyText("Barbearia 2 Irmãos", { allowDigits: true })).toBe(
      "Barbearia 2 Irmãos"
    );
  });
});

describe("maskPhoneBR", () => {
  it("formata celular com 11 dígitos", () => {
    expect(maskPhoneBR("11999998888")).toBe("(11) 99999-8888");
  });
  it("formata fixo com 10 dígitos", () => {
    expect(maskPhoneBR("1134567890")).toBe("(11) 3456-7890");
  });
  it("ignora letras e limita a 11 dígitos", () => {
    expect(maskPhoneBR("98981870979sssss")).toBe("(98) 98187-0979");
  });
  it("retorna vazio para entrada vazia", () => {
    expect(maskPhoneBR("")).toBe("");
  });
});

describe("maskDateBR", () => {
  it("formata dd/mm/aaaa", () => {
    expect(maskDateBR("28051990")).toBe("28/05/1990");
  });
  it("limita a 8 dígitos", () => {
    expect(maskDateBR("280519902755760")).toBe("28/05/1990");
  });
});

describe("isValidDateBR", () => {
  it("aceita data válida", () => {
    expect(isValidDateBR("28/05/1990")).toBe(true);
  });
  it("rejeita mês inválido", () => {
    expect(isValidDateBR("28/13/1990")).toBe(false);
  });
  it("rejeita ano no futuro", () => {
    expect(isValidDateBR("28/05/2757")).toBe(false);
  });
  it("rejeita formato incompleto", () => {
    expect(isValidDateBR("28/05")).toBe(false);
  });
});

describe("conversão de datas", () => {
  it("dd/mm/aaaa → aaaa-mm-dd", () => {
    expect(dateBRToISO("28/05/1990")).toBe("1990-05-28");
  });
  it("aaaa-mm-dd → dd/mm/aaaa", () => {
    expect(isoToDateBR("1990-05-28")).toBe("28/05/1990");
  });
  it("retorna vazio em formato inválido", () => {
    expect(dateBRToISO("28/05")).toBe("");
    expect(isoToDateBR("")).toBe("");
  });
});

describe("máscara de dinheiro", () => {
  it("digitação dos centavos para o real", () => {
    expect(maskMoneyBR("2500")).toBe("25,00");
  });
  it("formata milhar no padrão BR", () => {
    expect(maskMoneyBR("123456")).toBe("1.234,56");
  });
  it("converte tela → banco", () => {
    expect(moneyBRToDot("1.234,56")).toBe("1234.56");
  });
  it("converte banco → tela", () => {
    expect(moneyDotToBR("1234.56")).toBe("1.234,56");
  });
  it("retorna vazio para entrada vazia", () => {
    expect(maskMoneyBR("")).toBe("");
    expect(moneyBRToDot("")).toBe("");
  });
});

describe("maskSlug", () => {
  it("gera slug a partir de nome com espaços e acentos", () => {
    expect(maskSlug("Studio Cabelo & Cia")).toBe("studio-cabelo-cia");
  });
  it("remove caracteres especiais", () => {
    expect(maskSlug("salão@legal!")).toBe("salao-legal");
  });
});
