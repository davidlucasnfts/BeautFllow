import { themes } from "./segment-palettes";

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

// Configuração de horários do estabelecimento (salva em salons.settings como JSON)
export interface ScheduleSettings {
  /** Horário que a agenda começa, ex: "07:00" */
  dayStart: string;
  /** Horário que a agenda termina (último slot começa antes disso), ex: "21:00" */
  dayEnd: string;
  /** Espaço entre horários, em minutos (30 ou 60) */
  slotMinutes: number;
}

export const defaultScheduleSettings: ScheduleSettings = {
  dayStart: Schedule.dayStart,
  dayEnd: Schedule.dayEnd,
  slotMinutes: Schedule.slotMinutes,
};

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Lê o JSON de settings e devolve o id do tema salvo, se existir no catálogo */
export function parseThemeSettings(
  raw: string | null | undefined
): string | null {
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object") return null;
    const theme = (parsed as { theme?: unknown }).theme;
    return typeof theme === "string" && theme in themes ? theme : null;
  } catch {
    return null;
  }
}

/** Lê o JSON salvo no banco e devolve a configuração válida (ou o padrão) */
export function parseScheduleSettings(
  raw: string | null | undefined
): ScheduleSettings {
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object") return defaultScheduleSettings;
    const s = parsed as Partial<ScheduleSettings>;
    return {
      dayStart:
        typeof s.dayStart === "string" && TIME_REGEX.test(s.dayStart)
          ? s.dayStart
          : defaultScheduleSettings.dayStart,
      dayEnd:
        typeof s.dayEnd === "string" && TIME_REGEX.test(s.dayEnd)
          ? s.dayEnd
          : defaultScheduleSettings.dayEnd,
      slotMinutes:
        typeof s.slotMinutes === "number" &&
        s.slotMinutes >= 15 &&
        s.slotMinutes <= 120
          ? Math.floor(s.slotMinutes)
          : defaultScheduleSettings.slotMinutes,
    };
  } catch {
    return defaultScheduleSettings;
  }
}
