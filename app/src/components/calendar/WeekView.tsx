import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import EventCard from "./EventCard";
import type {
  CalendarAppointment,
  CalendarClient,
  CalendarService,
} from "./types";

interface WeekViewProps {
  weekDays: Date[];
  today: Date;
  appointmentsByDay: Record<string, CalendarAppointment[]>;
  clients: CalendarClient[];
  services: CalendarService[];
  onStart: (id: number) => void;
  onConclude: (appt: CalendarAppointment) => void;
  onCancel: (id: number) => void;
}

/**
 * Semana em faixas horizontais: cada dia é uma linha (label à esquerda no
 * desktop, no topo no mobile) e os atendimentos ficam lado a lado na
 * sequência do horário — usa a largura toda, diferente das colunas estreitas.
 */
export default function WeekView({
  weekDays,
  today,
  appointmentsByDay,
  clients,
  services,
  onStart,
  onConclude,
  onCancel,
}: WeekViewProps) {
  return (
    <div className="space-y-2">
      {weekDays.map(day => {
        const key = format(day, "yyyy-MM-dd");
        const dayAppts = appointmentsByDay[key] ?? [];
        const isToday = isSameDay(day, today);
        return (
          <div
            key={key}
            className={`rounded-lg border p-3 ${
              isToday ? "border-rose-300 bg-rose-50/30" : ""
            }`}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <div className="flex sm:flex-col items-center sm:items-start gap-2 sm:gap-0 sm:w-24 shrink-0 sm:pt-0.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {format(day, "EEE", { locale: ptBR })}
                </p>
                <p
                  className={`text-3xl font-extrabold leading-none ${
                    isToday ? "text-rose-600" : "text-primary"
                  }`}
                >
                  {format(day, "dd")}
                </p>
                <p className="mt-auto hidden pt-2 text-[11px] leading-tight text-muted-foreground sm:block">
                  <b className="text-foreground">{dayAppts.length}</b>{" "}
                  atendimento{dayAppts.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex-1 flex flex-wrap gap-2">
                {dayAppts.map(appt => (
                  <div key={appt.id} className="w-full sm:w-60">
                    <EventCard
                      appt={appt}
                      client={clients.find(c => c.id === appt.clientId)}
                      service={services.find(s => s.id === appt.serviceId)}
                      onStart={onStart}
                      onConclude={onConclude}
                      onCancel={onCancel}
                      variant="week"
                    />
                  </div>
                ))}
                {dayAppts.length === 0 && (
                  <p className="text-xs text-muted-foreground self-center py-1">
                    Sem agendamentos
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
