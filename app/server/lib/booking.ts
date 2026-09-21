/**
 * Lógica pura do agendamento — extraída do public-router para ser
 * testável sem banco de dados. Protege as regras do "caminho do dinheiro":
 * geração de slots, sobreposição de horários e atribuição de profissional.
 */

export function addMinutes(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = (h * 60 + m + minutes) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(
    total % 60
  ).padStart(2, "0")}`;
}

export function floorToSlot(hhmm: string, stepMinutes = 30): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m;
  const floored = total - (total % stepMinutes);
  return `${String(Math.floor(floored / 60)).padStart(2, "0")}:${String(
    floored % 60
  ).padStart(2, "0")}`;
}

/** Grade de horários candidatos do dia (mesma regra do frontend) */
export function generateSlots(
  dayStart: string,
  dayEnd: string,
  stepMinutes: number
): string[] {
  const [sh, sm] = dayStart.split(":").map(Number);
  const [eh, em] = dayEnd.split(":").map(Number);
  const slots: string[] = [];
  let t = sh * 60 + sm;
  const end = eh * 60 + em;
  while (t < end) {
    slots.push(
      `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(
        t % 60
      ).padStart(2, "0")}`
    );
    t += stepMinutes;
  }
  return slots;
}

/** Status que não ocupam agenda (cancelado/faltou podem reagendar) */
export const IGNORED_STATUSES = ["cancelled", "no_show"] as const;

/** Intervalos [startA,endA) e [startB,endB) se tocam? (extremo não conta) */
export function intervalsOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  return startA < endB && endA > startB;
}

export type BusyAppointment = {
  professionalId: number | null;
  startTime: string;
  endTime: string | null;
  status: string;
};

/** Profissional está livre no intervalo? Ignora status cancelado/no_show */
export function isProfessionalFree(
  professionalId: number,
  appointments: BusyAppointment[],
  startTime: string,
  endTime: string
): boolean {
  return !appointments.some(a => {
    if (IGNORED_STATUSES.includes(a.status as (typeof IGNORED_STATUSES)[number]))
      return false;
    if (a.professionalId !== professionalId || !a.endTime) return false;
    return intervalsOverlap(a.startTime, a.endTime, startTime, endTime);
  });
}

/** Primeiro profissional livre no intervalo (ou null se todos ocupados) */
export function findFreeProfessional(
  professionals: { id: number }[],
  appointments: BusyAppointment[],
  startTime: string,
  endTime: string
): { id: number } | null {
  return (
    professionals.find(p =>
      isProfessionalFree(p.id, appointments, startTime, endTime)
    ) ?? null
  );
}

/** Slots livres para "sem preferência": ALGUM profissional livre no intervalo */
export function freeSlotsForAnyone(
  professionals: { id: number }[],
  appointments: BusyAppointment[],
  schedule: { dayStart: string; dayEnd: string; slotMinutes: number },
  durationMinutes: number
): string[] {
  if (professionals.length === 0) return [];
  return generateSlots(
    schedule.dayStart,
    schedule.dayEnd,
    schedule.slotMinutes
  ).filter(slot => {
    const slotEnd = addMinutes(slot, durationMinutes);
    return professionals.some(p =>
      isProfessionalFree(p.id, appointments, slot, slotEnd)
    );
  });
}
