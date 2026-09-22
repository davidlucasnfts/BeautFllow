import { Schedule } from "@contracts/constants";
import { dateBRToISO } from "./input-masks";

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

/** Horário mínimo selecionável para uma data. Se a data for hoje (fuso de
 *  Brasília), retorna o horário atual "HH:mm" — slots antes dele já passaram
 *  e não devem aparecer. Para qualquer outra data, retorna null (sem corte). */
export function pastCutoffForDate(isoDate: string): string | null {
  const nowBR = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  );
  const todayBR = dateBRToISO(
    nowBR.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  );
  if (isoDate !== todayBR) return null;
  return nowBR.toTimeString().slice(0, 5);
}
