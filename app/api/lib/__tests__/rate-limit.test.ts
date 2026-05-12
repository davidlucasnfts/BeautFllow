import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit } from "../rate-limit";

describe("rate-limit", () => {
  beforeEach(() => {
    // Limpar store entre testes (hack para Map global)
    // Em produção não precisa, mas para testes isolados é melhor
  });

  it("deve permitir primeira requisição", () => {
    const result = checkRateLimit("ip:1", 5, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("deve permitir até o limite", () => {
    const key = "ip:2";
    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit(key, 5, 60_000);
      expect(result.allowed).toBe(true);
    }
  });

  it("deve bloquear após exceder o limite", () => {
    const key = "ip:3";
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key, 5, 60_000);
    }
    const result = checkRateLimit(key, 5, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("deve resetar após a janela expirar", () => {
    const key = "ip:4";
    checkRateLimit(key, 1, 1); // 1 req, 1ms window

    // Esperar a janela expirar
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = checkRateLimit(key, 1, 1);
        expect(result.allowed).toBe(true);
        resolve(undefined);
      }, 10);
    });
  });

  it("deve ter resetAt no futuro", () => {
    const result = checkRateLimit("ip:5", 5, 60_000);
    expect(result.resetAt).toBeGreaterThan(Date.now());
  });

  it("deve decrementar remaining corretamente", () => {
    const key = "ip:6";
    const r1 = checkRateLimit(key, 5, 60_000);
    expect(r1.remaining).toBe(4);

    const r2 = checkRateLimit(key, 5, 60_000);
    expect(r2.remaining).toBe(3);
  });
});
