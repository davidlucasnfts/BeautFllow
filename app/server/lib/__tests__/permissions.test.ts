import { describe, expect, it } from "vitest";
import { canAccess, type PermissionArea } from "@contracts/permissions";

const ALL_AREAS: PermissionArea[] = [
  "dashboard",
  "appointments",
  "clients",
  "services",
  "professionals",
  "financial",
  "products",
  "communications",
  "consent",
  "team",
  "settings",
];

describe("canAccess — matriz de permissões", () => {
  it("owner acessa todas as áreas", () => {
    for (const area of ALL_AREAS) {
      expect(canAccess("owner", area)).toBe(true);
    }
  });

  it("admin acessa tudo exceto settings", () => {
    for (const area of ALL_AREAS) {
      expect(canAccess("admin", area)).toBe(area !== "settings");
    }
  });

  it("receptionist acessa dashboard, appointments, clients e communications", () => {
    const allowed: PermissionArea[] = [
      "dashboard",
      "appointments",
      "clients",
      "communications",
    ];
    for (const area of ALL_AREAS) {
      expect(canAccess("receptionist", area)).toBe(allowed.includes(area));
    }
  });

  it("professional acessa apenas dashboard e appointments", () => {
    const allowed: PermissionArea[] = ["dashboard", "appointments"];
    for (const area of ALL_AREAS) {
      expect(canAccess("professional", area)).toBe(allowed.includes(area));
    }
  });

  it("receptionist não acessa áreas financeiras nem de equipe", () => {
    expect(canAccess("receptionist", "financial")).toBe(false);
    expect(canAccess("receptionist", "products")).toBe(false);
    expect(canAccess("receptionist", "services")).toBe(false);
    expect(canAccess("receptionist", "professionals")).toBe(false);
    expect(canAccess("receptionist", "consent")).toBe(false);
    expect(canAccess("receptionist", "team")).toBe(false);
  });

  it("professional não acessa clientes nem mensagens", () => {
    expect(canAccess("professional", "clients")).toBe(false);
    expect(canAccess("professional", "communications")).toBe(false);
  });

  it("admin gerencia equipe (team) mas não configurações (settings)", () => {
    expect(canAccess("admin", "team")).toBe(true);
    expect(canAccess("admin", "settings")).toBe(false);
  });
});
