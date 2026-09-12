import type { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { CheckCheck, Play, XCircle } from "lucide-react";
import type { CalendarAppointment } from "@/components/calendar/types";

const ACTIVE_STATUSES = ["scheduled", "confirmed", "checked_in", "in_progress"];

interface AppointmentActionsProps {
  appt: CalendarAppointment;
  onStart: (id: number) => void;
  onConclude: (appt: CalendarAppointment) => void;
  onCancel: (id: number) => void;
  className?: string;
  /** Empilha os botões na largura total (colunas estreitas da semana) */
  stack?: boolean;
}

/**
 * Ações rápidas do compromisso (desktop — EventCard semana/dia).
 *
 * Matriz por status:
 * - scheduled/confirmed: Iniciar, Concluir, Cancelar
 * - checked_in/in_progress: Concluir, Cancelar
 * - completed/cancelled/no_show: nenhuma
 *
 * Peso visual: Iniciar = tema (sólido), Concluir = verde sólido,
 * Cancelar = outline (destrutivo discreto).
 */
export default function AppointmentActions({
  appt,
  onStart,
  onConclude,
  onCancel,
  className = "",
  stack = false,
}: AppointmentActionsProps) {
  const stop = (handler: () => void) => (e: MouseEvent) => {
    e.stopPropagation();
    handler();
  };

  const canStart = appt.status === "scheduled" || appt.status === "confirmed";
  const canConclude = ACTIVE_STATUSES.includes(appt.status);

  const btnClass = stack
    ? "w-full justify-center gap-1 px-1.5 py-1 text-[10px] font-medium"
    : "h-auto gap-1 px-1.5 py-0.5 text-[10px] font-medium";

  return (
    <div
      className={`flex gap-1.5 justify-end ${
        stack ? "w-full flex-col" : "flex-row flex-wrap"
      } ${className}`}
    >
      {canStart && (
        <Button
          type="button"
          size="sm"
          onClick={stop(() => onStart(appt.id))}
          className={`${btnClass} bg-primary text-primary-foreground hover:bg-primary/90`}
        >
          <Play className="h-3 w-3" />
          Iniciar
        </Button>
      )}
      {canConclude && (
        <Button
          type="button"
          size="sm"
          onClick={stop(() => onConclude(appt))}
          className={`${btnClass} bg-green-600 text-white hover:bg-green-700`}
        >
          <CheckCheck className="h-3 w-3" />
          Concluir
        </Button>
      )}
      {canConclude && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={stop(() => onCancel(appt.id))}
          className={`${btnClass} border-red-600 text-red-600 hover:bg-red-50 hover:text-red-600`}
        >
          <XCircle className="h-3 w-3" />
          Cancelar
        </Button>
      )}
    </div>
  );
}
