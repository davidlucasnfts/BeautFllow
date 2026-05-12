import { describe, it, expect } from "vitest";
import { sanitizeInput, isValidEmail } from "../security-utils";

describe("security-utils", () => {
  describe("sanitizeInput", () => {
    it("deve escapar tags HTML", () => {
      const result = sanitizeInput("<script>alert('xss')</script>");
      expect(result).toContain("&lt;script&gt;");
      expect(result).toContain("&#x27;xss&#x27;");
      expect(result).toContain("&lt;&#x2F;script&gt;");
    });

    it("deve escapar aspas duplas", () => {
      expect(sanitizeInput('"quoted"')).toBe("&quot;quoted&quot;");
    });

    it("deve manter texto normal", () => {
      expect(sanitizeInput("texto normal")).toBe("texto normal");
    });

    it("deve escapar múltiplos caracteres", () => {
      const input = '<div class="test">\'content\'</div>';
      const result = sanitizeInput(input);
      expect(result).toContain("&lt;div");
      expect(result).toContain("class=&quot;test&quot;");
      expect(result).toContain("&#x27;content&#x27;");
      expect(result).toContain("&lt;&#x2F;div&gt;");
    });
  });

  describe("isValidEmail", () => {
    it("deve validar email correto", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
    });

    it("deve rejeitar email sem @", () => {
      expect(isValidEmail("testexample.com")).toBe(false);
    });

    it("deve rejeitar email sem domínio", () => {
      expect(isValidEmail("test@")).toBe(false);
    });

    it("deve rejeitar email vazio", () => {
      expect(isValidEmail("")).toBe(false);
    });

    it("deve validar email com subdomínio", () => {
      expect(isValidEmail("test@sub.example.com")).toBe(true);
    });

    it("deve rejeitar email sem TLD", () => {
      expect(isValidEmail("test@example")).toBe(false);
    });
  });
});
