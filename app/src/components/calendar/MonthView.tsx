import { format, isSameDay, isSameMonth } from "date-fns";
import type { CalendarAppointment } from "./types";

interface MonthViewProps {
  /** 42 dias (6 semanas) começando na segunda da semana do dia 1 */
  monthDays: Date[];
  /** Mês exibido (para deixar dias de outros meses apagados) */
  cursorMonth: Date;
  today: Date;
  appointmentsByDay: Record<string, CalendarAppointment[]>;
  /** Clique no dia abre a visão diária daquela data */
  onSelectDay: (day: Date) => void;
}

const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

/** Visão mensal: grade de dias com a quantidade de atendimentos de cada dia
 *  (chips de horário não cabem no mobile — clique no dia abre a visão diária) */
export default function MonthView({
  monthDays,
  cursorMonth,
  today,
  appointmentsByDay,
  onSelectDay,
}: MonthViewProps) {
  return (
    <div className="grid grid-cols-7 gap-px rounded-lg border bg-border overflow-hidden">
      {WEEKDAY_LABELS.map(w => (
        <div
          key={w}
          className="bg-muted/60 py-2 text-center text-[10px] sm:text-xs font-medium text-muted-foreground uppercase"
        >
          {w}
        </div>
      ))}
      {monthDays.map(day => {
        const key = format(day, "yyyy-MM-dd");
        const count = (appointmentsByDay[key] ?? []).length;
        const todayCell = isSameDay(day, today);
        const outside = !isSameMonth(day, cursorMonth);
        return (
          <button
            type="button"
            key={key}
            onClick={() => onSelectDay(day)}
            className={`relative min-h-[64px] sm:min-h-[100px] bg-background p-1 sm:p-1.5 text-left align-top transition-colors hover:bg-blue-50/50 ${
              outside ? "text-muted-foreground/50" : ""
            } ${todayCell ? "bg-rose-50/60" : ""}`}
          >
            <span
              className={`inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-[11px] sm:text-xs font-semibold ${
                todayCell ? "bg-rose-600 text-white" : ""
              }`}
            >
              {format(day, "d")}
            </span>
            {count > 0 && (
              <span className="absolute bottom-1 right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
