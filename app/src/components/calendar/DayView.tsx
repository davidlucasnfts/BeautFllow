import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import EventCard from "./EventCard";
import { HOUR_HEIGHT, START_HOUR, END_HOUR } from "./constants";
import type {
  CalendarAppointment,
  CalendarClient,
  CalendarService,
  CalendarProfessional,
} from "./types";

interface DayViewProps {
  day: Date;
  appointments: CalendarAppointment[];
  clients: CalendarClient[];
  services: CalendarService[];
  professionals: CalendarProfessional[];
  onCheckIn: (id: number) => void;
  onCancel: (id: number) => void;
  onReschedule?: (appointmentId: number, newStartTime: string) => void;
}

export default function DayView({
  day,
  appointments,
  clients,
  services,
  professionals,
  onCheckIn,
  onCancel,
  onReschedule,
}: DayViewProps) {
  const hours = Array.from(
    { length: END_HOUR - START_HOUR + 1 },
    (_, i) => START_HOUR + i
  );

  const sortedAppointments = [...appointments].sort((a, b) =>
    (a.startTime ?? "").localeCompare(b.startTime ?? "")
  );

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-muted/50 px-4 py-3 border-b">
        <h2 className="text-lg font-semibold capitalize">
          {format(day, "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </h2>
        <p className="text-sm text-muted-foreground">
          {appointments.length} agendamento{appointments.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Timeline */}
      <div className="relative" style={{ height: hours.length * HOUR_HEIGHT }}>
        {/* Grid de horários (drop zones) */}
        {hours.map((hour, index) => (
          <div
            key={hour}
            className="absolute w-full border-b border-dashed border-border/50 flex group"
            style={{ top: index * HOUR_HEIGHT, height: HOUR_HEIGHT }}
            onDragOver={(e) => {
              if (onReschedule) {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }
            }}
            onDrop={(e) => {
              if (!onReschedule) return;
              e.preventDefault();
              const appointmentId = Number(e.dataTransfer.getData("appointmentId"));
              const newStartTime = `${String(hour).padStart(2, "0")}:00`;
              onReschedule(appointmentId, newStartTime);
            }}
          >
            <div className="w-16 shrink-0 text-right pr-3 pt-1">
              <span className="text-xs text-muted-foreground font-medium">
                {String(hour).padStart(2, "0")}:00
              </span>
            </div>
            <div className="flex-1 relative">
              {/* Indicador de drop */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-primary/5 transition-opacity pointer-events-none" />
            </div>
          </div>
        ))}

        {/* Eventos */}
        {sortedAppointments.map((appt) => {
          const top = getTimePosition(appt.startTime);
          const height = getDurationHeight(
            appt.startTime,
            appt.endTime,
            services.find((s) => s.id === appt.serviceId)?.durationMinutes
          );

          return (
            <div
              key={appt.id}
              className="absolute left-16 right-2"
              style={{
                top,
                height: Math.max(height, 48),
              }}
            >
              <EventCard
                appt={appt}
                client={clients.find((c) => c.id === appt.clientId)}
                service={services.find((s) => s.id === appt.serviceId)}
                professional={professionals.find((p) => p.id === appt.professionalId)}
                onCheckIn={onCheckIn}
                onCancel={onCancel}
                onReschedule={onReschedule}
                variant="day"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getTimePosition(timeStr: string | null): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  const hourIndex = hours - START_HOUR;
  return hourIndex * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT;
}

function getDurationHeight(
  startTime: string | null,
  endTime: string | null,
  durationMinutes?: number
): number {
  if (endTime && startTime) {
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const diffMinutes = (eh * 60 + em) - (sh * 60 + sm);
    return (diffMinutes / 60) * HOUR_HEIGHT;
  }
  if (durationMinutes) {
    return (durationMinutes / 60) * HOUR_HEIGHT;
  }
  return HOUR_HEIGHT;
}
