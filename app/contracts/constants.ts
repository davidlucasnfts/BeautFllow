export const Session = {
  cookieName: "studioflow_sid",
  maxAgeMs: 365 * 24 * 60 * 60 * 1000,
} as const;

export const ErrorMessages = {
  unauthenticated: "Authentication required",
  insufficientRole: "Insufficient permissions",
} as const;

export const Paths = {
  login: "/login",
} as const;

// Agenda: grade de horários padrão do projeto (slots de 30 em 30 minutos)
export const Schedule = {
  slotMinutes: 30,
  dayStart: "07:00",
  dayEnd: "21:00",
} as const;
