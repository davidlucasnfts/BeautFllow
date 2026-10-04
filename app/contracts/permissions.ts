// Matriz de permissões do controle de acessos (compartilhada front + back).
// Áreas do sistema e quais papéis de equipe podem acessar cada uma.

export type SalonRole = "owner" | "admin" | "professional" | "receptionist";

export type PermissionArea =
  | "dashboard"
  | "appointments"
  | "clients"
  | "services"
  | "professionals"
  | "financial"
  | "products"
  | "communications"
  | "consent"
  | "team"
  | "settings";

const AREA_ROLES: Record<PermissionArea, SalonRole[]> = {
  dashboard: ["owner", "admin", "professional", "receptionist"],
  appointments: ["owner", "admin", "professional", "receptionist"],
  clients: ["owner", "admin", "receptionist"],
  services: ["owner", "admin"],
  professionals: ["owner", "admin"],
  financial: ["owner", "admin"],
  products: ["owner", "admin"],
  communications: ["owner", "admin", "receptionist"],
  consent: ["owner", "admin"],
  team: ["owner", "admin"],
  settings: ["owner"],
};

/** Verifica se o papel tem acesso à área informada */
export function canAccess(role: SalonRole, area: PermissionArea): boolean {
  return AREA_ROLES[area].includes(role);
}

export const SALON_ROLE_LABELS: Record<SalonRole, string> = {
  owner: "Dono",
  admin: "Administrador",
  professional: "Profissional",
  receptionist: "Recepcionista",
};

/** Papéis que podem ser atribuídos por convite (dono não é convidável) */
export const INVITABLE_ROLES: Exclude<SalonRole, "owner">[] = [
  "admin",
  "professional",
  "receptionist",
];
