import { describe, it, expect } from "vitest";
import {
  Session,
  ErrorMessages,
  Paths,
  defaultClientStatusSettings,
  parseClientStatusSettings,
} from "../constants";

describe("constants", () => {
  it("Session.cookieName deve ser studioflow_sid", () => {
    expect(Session.cookieName).toBe("studioflow_sid");
  });

  it("Session.maxAgeMs deve ser 1 ano em ms", () => {
    expect(Session.maxAgeMs).toBe(365 * 24 * 60 * 60 * 1000);
  });

  it("ErrorMessages.unauthenticated deve estar definido", () => {
    expect(ErrorMessages.unauthenticated).toBe("Authentication required");
  });

  it("ErrorMessages.insufficientRole deve estar definido", () => {
    expect(ErrorMessages.insufficientRole).toBe("Insufficient permissions");
  });

  it("Paths.login deve ser /login", () => {
    expect(Paths.login).toBe("/login");
  });
});

describe("parseClientStatusSettings", () => {
  it("deve retornar o padrão quando settings é nulo, vazio ou inválido", () => {
    expect(parseClientStatusSettings(null)).toEqual(defaultClientStatusSettings);
    expect(parseClientStatusSettings(undefined)).toEqual(
      defaultClientStatusSettings,
    );
    expect(parseClientStatusSettings("")).toEqual(defaultClientStatusSettings);
    expect(parseClientStatusSettings("não é json")).toEqual(
      defaultClientStatusSettings,
    );
    expect(parseClientStatusSettings("{}")).toEqual(defaultClientStatusSettings);
    expect(parseClientStatusSettings('{"clientStatus": null}')).toEqual(
      defaultClientStatusSettings,
    );
  });

  it("deve ler configuração válida salva em settings", () => {
    const settings = JSON.stringify({
      theme: "ambar",
      clientStatus: {
        mode: "visits",
        vipThreshold: 8,
        atRiskDays: 30,
        inactiveDays: 60,
      },
    });
    expect(parseClientStatusSettings(settings)).toEqual({
      mode: "visits",
      vipThreshold: 8,
      atRiskDays: 30,
      inactiveDays: 60,
    });
  });

  it("deve ignorar mode inválido e assumir spent", () => {
    const settings = JSON.stringify({
      clientStatus: { mode: "outra_coisa", vipThreshold: 500 },
    });
    const result = parseClientStatusSettings(settings);
    expect(result.mode).toBe("spent");
    expect(result.vipThreshold).toBe(500);
  });

  it("deve aceitar valores numéricos como string e limitar ao máximo", () => {
    const settings = JSON.stringify({
      clientStatus: {
        mode: "spent",
        vipThreshold: "1500",
        atRiskDays: 99999,
        inactiveDays: 99999,
      },
    });
    const result = parseClientStatusSettings(settings);
    expect(result.vipThreshold).toBe(1500);
    expect(result.atRiskDays).toBe(365);
    expect(result.inactiveDays).toBe(730);
  });

  it("deve usar fallback quando o campo é inválido", () => {
    const settings = JSON.stringify({
      clientStatus: { vipThreshold: -10, atRiskDays: "abc" },
    });
    const result = parseClientStatusSettings(settings);
    expect(result.vipThreshold).toBe(defaultClientStatusSettings.vipThreshold);
    expect(result.atRiskDays).toBe(defaultClientStatusSettings.atRiskDays);
  });
});
