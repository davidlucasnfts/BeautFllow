import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import EventCard from "./EventCard";
import type { CalendarAppointment, CalendarClient, CalendarService } from "./types";

interface WeekViewProps {
  weekDays: Date[];
  today: Date;
  appointmentsByDay: Record<string, CalendarAppointment[]>;
  clients: CalendarClient[];
  services: CalendarService[];
  onCheckIn: (id: number) => void;
  onCancel: (id: number) => void;
}

export default function WeekView({
  weekDays,
  today,
  appointmentsByDay,
  clients,
  services,
  onCheckIn,
  onCancel,
}: WeekViewProps) {
  return (
    <div className="grid grid-cols-7 gap-3">
      {weekDays.map((day) => {
        const key = format(day, "yyyy-MM-dd");
        const dayAppts = appointmentsByDay[key] ?? [];
        const isToday = isSameDay(day, today);
        return (
          <div
            key={key}
            className={`border rounded-lg p-3 ${
              isToday ? "border-rose-300 bg-rose-50/30" : ""
            }`}
          >
            <div className="text-center mb-3">
              <p className="text-xs text-muted-foreground uppercase">
                {format(day, "EEE", { locale: ptBR })}
              </p>
              <p
                className={`text-lg font-bold ${
                  isToday ? "text-rose-600" : ""
                }`}
              >
                {format(day, "dd")}
              </p>
            </div>
            <div className="space-y-2">
              {dayAppts.map((appt) => (
                <EventCard
                  key={appt.id}
                  appt={appt}
                  client={clients.find((c) => c.id === appt.clientId)}
                  service={services.find((s) => s.id === appt.serviceId)}
                  onCheckIn={onCheckIn}
                  onCancel={onCancel}
                  variant="week"
                />
              ))}
              {dayAppts.length === 0 && (
                <p className="text-[10px] text-muted-foreground text-center py-2">
                  Sem agendamentos
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
