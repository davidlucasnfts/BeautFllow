import type { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { CheckCheck, Pencil, Play, SlidersHorizontal, XCircle } from "lucide-react";
import type { CalendarAppointment } from "@/components/calendar/types";
import { useSalon } from "@/providers/useSalon";
import { useConcludeQuick } from "@/hooks/useConcludeQuick";

const START_STATUSES = ["scheduled", "confirmed", "checked_in"];
const EDIT_STATUSES = ["scheduled", "confirmed", "checked_in", "in_progress"];
const CANCEL_STATUSES = ["scheduled", "confirmed", "checked_in", "in_progress"];

interface AppointmentActionsProps {
  appt: CalendarAppointment;
  onStart: (id: number) => void;
  /** Abre o checkout completo (Concluir com ajustes / modo manual) */
  onConclude: (appt: CalendarAppointment) => void;
  onCancel: (id: number) => void;
  onEdit?: (appt: CalendarAppointment) => void;
  className?: string;
}

/**
 * Ações rápidas do compromisso (desktop — EventCard semana/dia).
 *
 * Matriz por status:
 * - scheduled/confirmed/checked_in: Iniciar, Editar, Cancelar
 * - in_progress: Editar, Concluir, Cancelar
 * - completed/cancelled/no_show: nenhuma
 *
 * Fechamento automático (config do salão): "Concluir" fecha em 1 toque
 * (lançamento + comissão calculadas) e "Ajustes" abre o checkout completo.
 * Modo manual: "Concluir" abre o checkout, como antes.
 *
 * Peso visual: Iniciar = tema (sólido), Editar = azul sólido,
 * Concluir = verde sólido, Ajustes/Cancelar = outline.
 */
export default function AppointmentActions({
  appt,
  onStart,
  onConclude,
  onCancel,
  onEdit,
  className = "",
}: AppointmentActionsProps) {
  const { salon } = useSalon();
  const { concludeQuick, isPending } = useConcludeQuick();
  const auto = salon?.autoCheckout.enabled === true;

  const stop = (handler: () => void) => (e: MouseEvent) => {
    e.stopPropagation();
    handler();
  };

  const canStart = START_STATUSES.includes(appt.status);
  const canEdit = EDIT_STATUSES.includes(appt.status);
  const canConclude = appt.status === "in_progress";
  const canCancel = CANCEL_STATUSES.includes(appt.status);

  const btnClass = "h-auto gap-1 px-1.5 py-1 text-[10px] font-medium";

  return (
    <div className={`flex flex-row flex-wrap gap-1.5 ${className}`}>
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
      {onEdit && canEdit && (
        <Button
          type="button"
          size="sm"
          onClick={stop(() => onEdit(appt))}
          className={`${btnClass} bg-blue-600 text-white hover:bg-blue-700`}
        >
          <Pencil className="h-3 w-3" />
          Editar
        </Button>
      )}
      {canConclude && auto && salon && (
        <Button
          type="button"
          size="sm"
          disabled={isPending}
          onClick={stop(() => concludeQuick(appt, salon.id))}
          className={`${btnClass} bg-green-600 text-white hover:bg-green-700`}
        >
          <CheckCheck className="h-3 w-3" />
          {isPending ? "Concluindo..." : "Concluir"}
        </Button>
      )}
      {canConclude && auto && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          title="Concluir com adicionais (desconto, extras, forma de pagamento)"
          onClick={stop(() => onConclude(appt))}
          className={`${btnClass} border-green-600 text-green-700 hover:bg-green-50`}
        >
          <SlidersHorizontal className="h-3 w-3" />
          Concluir com adicionais
        </Button>
      )}
      {canConclude && !auto && (
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
      {canCancel && (
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
