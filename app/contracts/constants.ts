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

// Configuração dos status automáticos dos clientes (salva em salons.settings como JSON)
export interface ClientStatusSettings {
  /** Critério VIP: "spent" = valor gasto no mês, "visits" = atendimentos no mês */
  mode: "spent" | "visits";
  /** Limite do VIP: R$ (mode spent) ou quantidade (mode visits) no mês corrente */
  vipThreshold: number;
  /** Dias sem atender para virar "Sumindo" */
  atRiskDays: number;
  /** Dias sem atender para virar "Inativo" */
  inactiveDays: number;
}

export const defaultClientStatusSettings: ClientStatusSettings = {
  mode: "spent",
  vipThreshold: 1000,
  atRiskDays: 45,
  inactiveDays: 90,
};

const POSITIVE_INT = /^\d+$/;

/** Lê o JSON salvo no banco e devolve a configuração de status válida (ou o padrão) */
export function parseClientStatusSettings(
  raw: string | null | undefined
): ClientStatusSettings {
  const d = defaultClientStatusSettings;
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object") return d;
    const s = (parsed as { clientStatus?: Partial<ClientStatusSettings> })
      .clientStatus;
    if (!s || typeof s !== "object") return d;
    const num = (v: unknown, fallback: number, max: number) =>
      typeof v === "number" && Number.isFinite(v) && v >= 0
        ? Math.min(Math.floor(v), max)
        : typeof v === "string" && POSITIVE_INT.test(v)
          ? Math.min(parseInt(v, 10), max)
          : fallback;
    return {
      mode: s.mode === "visits" ? "visits" : "spent",
      vipThreshold: num(s.vipThreshold, d.vipThreshold, 999999),
      atRiskDays: Math.max(1, num(s.atRiskDays, d.atRiskDays, 365)),
      inactiveDays: Math.max(1, num(s.inactiveDays, d.inactiveDays, 730)),
    };
  } catch {
    return d;
  }
}

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
