import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { moneyDotToBR } from "@/lib/input-masks";
import type { CalendarAppointment } from "@/components/calendar/types";

/** Fechamento automático de atendimento (1 toque): cria o lançamento
 *  financeiro com comissão calculada e conclui o compromisso, sem abrir
 *  o checkout. Usado pelos botões de ação da agenda (dia/semana/fila). */
export function useConcludeQuick() {
  const utils = trpc.useUtils();

  const mutation = trpc.appointment.conclude.useMutation({
    onSuccess: result => {
      utils.appointment.list.invalidate();
      utils.financial.list.invalidate();
      utils.financial.summary.invalidate();
      utils.dashboard.metrics.invalidate();
      toast.success(
        `Concluído — R$ ${moneyDotToBR(result.amount)} no financeiro`
      );
    },
    onError: e => toast.error(e.message),
  });

  function concludeQuick(appt: CalendarAppointment, salonId: number) {
    if (mutation.isPending) return;
    mutation.mutate({ id: appt.id, salonId });
  }

  return { concludeQuick, isPending: mutation.isPending };
}
