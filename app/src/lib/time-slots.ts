import { Schedule } from "@contracts/constants";

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function toHHMM(totalMinutes: number): string {
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${String(
    totalMinutes % 60
  ).padStart(2, "0")}`;
}

/** Gera todos os horários da grade (ex: 07:00, 07:30, 08:00...) */
export function generateTimeSlots(
  start: string = Schedule.dayStart,
  end: string = Schedule.dayEnd,
  stepMinutes: number = Schedule.slotMinutes
): string[] {
  const slots: string[] = [];
  for (let t = toMinutes(start); t < toMinutes(end); t += stepMinutes) {
    slots.push(toHHMM(t));
  }
  return slots;
}

/** Arredonda um horário para baixo, no slot mais próximo (ex: 13:45 → 13:30) */
export function floorToSlot(
  hhmm: string,
  stepMinutes: number = Schedule.slotMinutes
): string {
  const total = toMinutes(hhmm);
  return toHHMM(total - (total % stepMinutes));
}

export interface TimeInterval {
  start: string;
  end: string;
}

/** Remove da grade os horários que colidem com intervalos ocupados
 * (considerando a duração do serviço a partir de cada horário) */
export function filterAvailableSlots(
  slots: string[],
  busyIntervals: TimeInterval[],
  durationMinutes: number
): string[] {
  return slots.filter(slot => {
    const slotEnd = toMinutes(slot) + durationMinutes;
    return !busyIntervals.some(
      busy =>
        toMinutes(busy.start) < slotEnd && toMinutes(busy.end) > toMinutes(slot)
    );
  });
}
