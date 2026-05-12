import { describe, it, expect } from "vitest";
import { Session, ErrorMessages, Paths } from "../constants";

describe("constants", () => {
  it("Session.cookieName deve ser kimi_sid", () => {
    expect(Session.cookieName).toBe("kimi_sid");
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

  it("Paths.oauthCallback deve ser /api/oauth/callback", () => {
    expect(Paths.oauthCallback).toBe("/api/oauth/callback");
  });
});
