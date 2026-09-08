import type { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { CheckCheck, CheckCircle2, XCircle } from "lucide-react";
import type { CalendarAppointment } from "@/components/calendar/types";

const ACTIVE_STATUSES = ["scheduled", "confirmed", "checked_in"];

interface AppointmentActionsProps {
  appt: CalendarAppointment;
  onCheckIn: (id: number) => void;
  onConclude: (appt: CalendarAppointment) => void;
  onCancel: (id: number) => void;
  className?: string;
}

/**
 * Coluna de ações rápidas do compromisso (desktop — EventCard semana/dia).
 *
 * Matriz por status:
 * - scheduled/confirmed: Chegada, Concluir, Cancelar
 * - checked_in: Concluir, Cancelar
 * - completed/cancelled/no_show/in_progress: nenhuma
 */
export default function AppointmentActions({
  appt,
  onCheckIn,
  onConclude,
  onCancel,
  className = "",
}: AppointmentActionsProps) {
  const stop = (handler: () => void) => (e: MouseEvent) => {
    e.stopPropagation();
    handler();
  };

  const canCheckIn = appt.status === "scheduled" || appt.status === "confirmed";
  const canConclude = ACTIVE_STATUSES.includes(appt.status);

  return (
    <div className={`flex flex-row flex-wrap gap-1.5 justify-end ${className}`}>
      {canCheckIn && (
        <Button
          type="button"
          size="sm"
          onClick={stop(() => onCheckIn(appt.id))}
          className="h-auto gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <CheckCircle2 className="h-3 w-3" />
          Chegada
        </Button>
      )}
      {canConclude && (
        <Button
          type="button"
          size="sm"
          onClick={stop(() => onConclude(appt))}
          className="h-auto gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-green-600 text-white hover:bg-green-700"
        >
          <CheckCheck className="h-3 w-3" />
          Concluir
        </Button>
      )}
      {canConclude && (
        <Button
          type="button"
          size="sm"
          onClick={stop(() => onCancel(appt.id))}
          className="h-auto gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-red-600 text-white hover:bg-red-700"
        >
          <XCircle className="h-3 w-3" />
          Cancelar
        </Button>
      )}
    </div>
  );
}
