import type { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { Check, CheckCheck, CheckCircle2, XCircle } from "lucide-react";
import type { CalendarAppointment } from "@/components/calendar/types";

const ACTIVE_STATUSES = ["scheduled", "confirmed", "checked_in"];

interface AppointmentActionsProps {
  appt: CalendarAppointment;
  onConfirm: (id: number) => void;
  onCheckIn: (id: number) => void;
  onConclude: (appt: CalendarAppointment) => void;
  onCancel: (id: number) => void;
  className?: string;
}

/**
 * Coluna de ações rápidas do compromisso, padronizada entre
 * FilaDoDia (mobile) e EventCard (semana/dia).
 *
 * Matriz por status:
 * - scheduled (origem online): Confirmar, Chegada, Concluir, Cancelar
 * - scheduled/confirmed: Chegada, Concluir, Cancelar
 * - checked_in: Concluir, Cancelar
 * - completed/cancelled/no_show/in_progress: nenhuma
 */
export default function AppointmentActions({
  appt,
  onConfirm,
  onCheckIn,
  onConclude,
  onCancel,
  className = "",
}: AppointmentActionsProps) {
  const stop = (handler: () => void) => (e: MouseEvent) => {
    e.stopPropagation();
    handler();
  };

  const canConfirm = appt.source === "online" && appt.status === "scheduled";
  const canCheckIn = appt.status === "scheduled" || appt.status === "confirmed";
  const canConclude = ACTIVE_STATUSES.includes(appt.status);

  return (
    <div className={`flex flex-row flex-wrap gap-1.5 justify-end ${className}`}>
      {canConfirm && (
        <Button
          type="button"
          size="sm"
          onClick={stop(() => onConfirm(appt.id))}
          className="h-auto gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-blue-600 text-white hover:bg-blue-700"
        >
          <Check className="h-3 w-3" />
          Confirmar
        </Button>
      )}
      {canCheckIn && (
        <Button
          type="button"
          size="sm"
          onClick={stop(() => onCheckIn(appt.id))}
          className="h-auto gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-green-600 text-white hover:bg-green-700"
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
