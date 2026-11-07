import { Skeleton } from "@/components/ui/skeleton";
import WeekView from "@/components/calendar/WeekView";
import DayView from "@/components/calendar/DayView";
import MonthView from "@/components/calendar/MonthView";
import FilaDoDia from "@/components/appointments/FilaDoDia";
import PendingPastAlert from "@/components/appointments/PendingPastAlert";
import type { Client, Professional, Service } from "@db/schema";
import type {
  ViewMode,
  CalendarAppointment,
  CalendarClient,
  CalendarService,
  CalendarProfessional,
} from "@/components/calendar/types";

interface AgendaViewsProps {
  isLoading: boolean;
  isMobile: boolean;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  today: Date;
  // dia
  selectedDate: Date;
  setSelectedDate: (fn: (d: Date) => Date) => void;
  filaDate: Date;
  setFilaDate: (d: Date) => void;
  salonId?: number;
  filterProfessional: string;
  filterService: string;
  /** Horário de funcionamento do salão — define a faixa da grade do dia */
  dayStart?: string;
  dayEnd?: string;
  dayAppointments: CalendarAppointment[];
  // semana
  weekDays: Date[];
  appointmentsByDay: Record<string, CalendarAppointment[]>;
  // mês
  monthDays: Date[];
  monthCursor: Date;
  monthAppointmentsByDay: Record<string, CalendarAppointment[]>;
  /** Atendimentos já filtrados (chips) da faixa carregada — usados na fila mobile */
  filaAppointments: CalendarAppointment[];
  clients: Client[];
  services: Service[];
  professionals: Professional[];
  highlightId?: number | null;
  onStart: (id: number) => void;
  onConclude: (appt: CalendarAppointment) => void;
  onCancel: (id: number) => void;
  onEdit?: (appt: CalendarAppointment) => void;
  onReschedule: (appointmentId: number, newStartTime: string) => void;
}

/** Seleção das visões da agenda (dia/semana/mês) + alerta de pendentes.
 *  Extraído da página Appointments pra respeitar o limite de 400 linhas. */
export default function AgendaViews({
  isLoading,
  isMobile,
  viewMode,
  setViewMode,
  today,
  selectedDate,
  setSelectedDate,
  filaDate,
  setFilaDate,
  salonId,
  filterProfessional,
  filterService,
  dayStart,
  dayEnd,
  dayAppointments,
  weekDays,
  appointmentsByDay,
  monthDays,
  monthCursor,
  monthAppointmentsByDay,
  filaAppointments,
  clients,
  services,
  professionals,
  highlightId,
  onStart,
  onConclude,
  onCancel,
  onEdit,
  onReschedule,
}: AgendaViewsProps) {
  if (isLoading) return <Skeleton className="h-96 w-full bg-muted" />;

  // alerta de pendentes aparece em todas as visões (dia/semana/mês);
  // "Ver dia" leva direto ao dia do pendente mais antigo, na visão Dia
  const pendingAlert = (
    <PendingPastAlert
      salonId={salonId}
      enabled
      filterProfessional={filterProfessional}
      filterService={filterService}
      onGoToDay={day => {
        setSelectedDate(() => day);
        if (isMobile) setFilaDate(day);
        setViewMode("day");
      }}
    />
  );

  if (viewMode === "day") {
    return (
      <div className="space-y-4">
        {pendingAlert}
        {isMobile ? (
          <FilaDoDia
            selectedDay={filaDate}
            onSelectDay={setFilaDate}
            appointments={filaAppointments}
            services={services as CalendarService[]}
            clients={clients}
            highlightId={highlightId}
            onStart={onStart}
            onConclude={onConclude}
            onCancel={onCancel}
            onEdit={onEdit}
          />
        ) : (
          <DayView
            day={selectedDate}
            appointments={dayAppointments}
            clients={clients as CalendarClient[]}
            services={services as CalendarService[]}
            professionals={professionals as CalendarProfessional[]}
            dayStart={dayStart}
            dayEnd={dayEnd}
            highlightId={highlightId}
            onStart={onStart}
            onConclude={onConclude}
            onCancel={onCancel}
            onEdit={onEdit}
            onReschedule={onReschedule}
          />
        )}
      </div>
    );
  }

  if (viewMode === "week") {
    return (
      <div className="space-y-4">
        {pendingAlert}
        <WeekView
          weekDays={weekDays}
          today={today}
          appointmentsByDay={appointmentsByDay}
          clients={clients as CalendarClient[]}
          services={services as CalendarService[]}
          onStart={onStart}
          onConclude={onConclude}
          onCancel={onCancel}
          onEdit={onEdit}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingAlert}
      <MonthView
        monthDays={monthDays}
        cursorMonth={monthCursor}
        today={today}
        appointmentsByDay={monthAppointmentsByDay}
        onSelectDay={day => {
          setSelectedDate(() => day);
          if (isMobile) setFilaDate(day);
          setViewMode("day");
        }}
      />
    </div>
  );
}
