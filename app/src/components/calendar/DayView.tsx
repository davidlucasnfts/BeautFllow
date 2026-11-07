import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import EventCard from "./EventCard";
import { HOUR_HEIGHT } from "./constants";
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
  /** Horário de abertura do salão ("HH:mm") — define o início da grade */
  dayStart?: string;
  /** Horário de fechamento do salão ("HH:mm") — define o fim da grade */
  dayEnd?: string;
  highlightId?: number | null;
  onStart: (id: number) => void;
  onConclude: (appt: CalendarAppointment) => void;
  onCancel: (id: number) => void;
  onEdit?: (appt: CalendarAppointment) => void;
  onReschedule?: (appointmentId: number, newStartTime: string) => void;
}

function toMinutes(hhmm: string | null | undefined): number | null {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":").map(Number);
  if (!Number.isInteger(h) || h < 0 || h > 23) return null;
  return h * 60 + (Number.isInteger(m) ? m : 0);
}

export default function DayView({
  day,
  appointments,
  clients,
  services,
  professionals,
  dayStart,
  dayEnd,
  highlightId,
  onStart,
  onConclude,
  onCancel,
  onEdit,
  onReschedule,
}: DayViewProps) {
  // Faixa da grade segue o horário de funcionamento do salão (fallback
  // 7–21, o padrão do Schedule). Agendamentos fora do horário (ex: manual)
  // expandem a faixa para que nunca fiquem invisíveis "fora da tela".
  // Cálculo em minutos para não cortar eventos que terminam com minutos
  // (ex: 21:30 precisa da grade até 22:00).
  const sortedAppointments = [...appointments].sort((a, b) =>
    (a.startTime ?? "").localeCompare(b.startTime ?? "")
  );
  let startMin = toMinutes(dayStart) ?? 7 * 60;
  let endMin = toMinutes(dayEnd) ?? 21 * 60;
  for (const appt of sortedAppointments) {
    const s = toMinutes(appt.startTime);
    const e = toMinutes(appt.endTime);
    if (s !== null && s < startMin) startMin = s;
    if (e !== null && e > endMin) endMin = e;
  }
  if (endMin <= startMin) endMin = startMin + 60;
  const startHour = Math.floor(startMin / 60);
  const endHour = Math.ceil(endMin / 60);

  const hours = Array.from(
    { length: endHour - startHour + 1 },
    (_, i) => startHour + i
  );

  // Posicionamento em cascata: o conteúdo do card (3 linhas + ações) é
  // maior que a altura de serviços curtos (30min = 32px), então o card
  // esticava e cobria o seguinte. Cada card tem altura mínima que acomoda
  // o conteúdo e nunca inicia antes do fim do card anterior.
  const MIN_CARD_HEIGHT = 80;
  let previousBottom = 0;
  const positioned = sortedAppointments.map(appt => {
    const timeTop = getTimePosition(appt.startTime, startHour);
    const top = Math.max(timeTop, previousBottom);
    const height = Math.max(
      getDurationHeight(
        appt.startTime,
        appt.endTime,
        services.find(s => s.id === appt.serviceId)?.durationMinutes
      ),
      MIN_CARD_HEIGHT
    );
    previousBottom = top + height;
    return { appt, top, height };
  });
  const timelineHeight = Math.max(
    hours.length * HOUR_HEIGHT,
    previousBottom
  );

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header — hierarquia: semana pequena, número gigante em destaque, mês médio */}
      <div className="bg-muted/50 px-4 py-3 border-b">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {capitalizeFirst(format(day, "EEEE", { locale: ptBR }))}
        </p>
        <div className="mt-0.5 flex items-baseline gap-2">
          <span className="text-4xl font-extrabold leading-none text-primary">
            {format(day, "dd")}
          </span>
          <span className="text-sm text-foreground">
            de {format(day, "MMMM 'de' yyyy", { locale: ptBR })}
          </span>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {appointments.length} agendamento
          {appointments.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Timeline */}
      <div className="relative" style={{ height: timelineHeight }}>
        {/* Grid de horários (drop zones) */}
        {hours.map((hour, index) => (
          <div
            key={hour}
            className="absolute w-full border-b border-dashed border-border/50 flex group"
            style={{ top: index * HOUR_HEIGHT, height: HOUR_HEIGHT }}
            onDragOver={e => {
              if (onReschedule) {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }
            }}
            onDrop={e => {
              if (!onReschedule) return;
              e.preventDefault();
              const appointmentId = Number(
                e.dataTransfer.getData("appointmentId")
              );
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
        {positioned.map(({ appt, top, height }) => {
          return (
            <div
              key={appt.id}
              className="absolute left-16 right-2"
              style={{
                top,
                height,
              }}
            >
              <EventCard
                appt={appt}
                client={clients.find(c => c.id === appt.clientId)}
                service={services.find(s => s.id === appt.serviceId)}
                professional={professionals.find(
                  p => p.id === appt.professionalId
                )}
                onStart={onStart}
                onConclude={onConclude}
                onCancel={onCancel}
                onEdit={onEdit}
                onReschedule={onReschedule}
                variant="day"
                isHighlighted={appt.id === highlightId}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getTimePosition(timeStr: string | null, startHour: number): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  const hourIndex = hours - startHour;
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
    const diffMinutes = eh * 60 + em - (sh * 60 + sm);
    return (diffMinutes / 60) * HOUR_HEIGHT;
  }
  if (durationMinutes) {
    return (durationMinutes / 60) * HOUR_HEIGHT;
  }
  return HOUR_HEIGHT;
}
