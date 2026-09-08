export const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700 border-blue-200",
  confirmed: "bg-indigo-100 text-indigo-700 border-indigo-200",
  checked_in: "bg-primary/15 text-primary border-primary/25",
  in_progress: "bg-violet-100 text-violet-700 border-violet-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  no_show: "bg-rose-100 text-rose-700 border-rose-200",
  cancelled: "bg-slate-100 text-slate-700 border-slate-200",
};

export const STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  checked_in: "Em andamento",
  in_progress: "Em andamento",
  completed: "Completo",
  no_show: "Faltou",
  cancelled: "Cancelado",
};

export const HOUR_HEIGHT = 64;
export const START_HOUR = 8;
export const END_HOUR = 20;

const ACTIVE_STATUSES = ["scheduled", "confirmed", "checked_in"];

/** O compromisso tem alguma ação rápida disponível no status atual? */
export function hasAppointmentActions(appt: { status: string }): boolean {
  return ACTIVE_STATUSES.includes(appt.status);
}
