import type { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { CheckCheck, XCircle } from "lucide-react";
import type { CalendarAppointment } from "@/components/calendar/types";

// NOTA: `checked_in`/`in_progress` ficam no backend para o futuro recurso de
// fila de espera / "Iniciar atendimento" — por ora a UI não usa (removido em 08/09).
const ACTIVE_STATUSES = ["scheduled", "confirmed", "checked_in"];

interface AppointmentActionsProps {
  appt: CalendarAppointment;
  onConclude: (appt: CalendarAppointment) => void;
  onCancel: (id: number) => void;
  className?: string;
}

/**
 * Coluna de ações rápidas do compromisso (desktop — EventCard semana/dia).
 *
 * Matriz por status:
 * - scheduled/confirmed/checked_in: Concluir, Cancelar
 * - completed/cancelled/no_show/in_progress: nenhuma
 */
export default function AppointmentActions({
  appt,
  onConclude,
  onCancel,
  className = "",
}: AppointmentActionsProps) {
  const stop = (handler: () => void) => (e: MouseEvent) => {
    e.stopPropagation();
    handler();
  };

  const canConclude = ACTIVE_STATUSES.includes(appt.status);

  return (
    <div className={`flex flex-row flex-wrap gap-1.5 justify-end ${className}`}>
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
