import { useMemo } from "react";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { hasAppointmentActions } from "@/components/calendar/constants";

interface PendingPastAlertProps {
  salonId?: number;
  /** Só consulta quando a visão Dia está ativa */
  enabled: boolean;
  filterProfessional: string;
  filterService: string;
  /** Leva o usuário ao dia do atendimento pendente mais antigo */
  onGoToDay: (day: Date) => void;
}

/** Aviso na visão Dia: atendimentos de dias anteriores que ficaram sem
 *  concluir e sem cancelar. Olha os últimos 90 dias, respeita o filtro de
 *  profissional/serviço ativo, e oferece ir direto ao dia mais antigo. */
export default function PendingPastAlert({
  salonId,
  enabled,
  filterProfessional,
  filterService,
  onGoToDay,
}: PendingPastAlertProps) {
  const yesterday = subDays(new Date(), 1);

  const { data: pastAppointments } = trpc.appointment.list.useQuery(
    {
      salonId: salonId ?? 0,
      fromDate: format(subDays(new Date(), 90), "yyyy-MM-dd"),
      toDate: format(yesterday, "yyyy-MM-dd"),
    },
    { enabled: enabled && !!salonId }
  );

  const pending = useMemo(
    () =>
      (pastAppointments ?? [])
        .filter(a => hasAppointmentActions(a))
        .filter(
          a =>
            (filterProfessional === "all" ||
              a.professionalId === Number(filterProfessional)) &&
            (filterService === "all" ||
              a.serviceId === Number(filterService))
        )
        .sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate)),
    [pastAppointments, filterProfessional, filterService]
  );

  if (!enabled || pending.length === 0) return null;

  const oldest = pending[0];
  const oldestDay = new Date(`${oldest.appointmentDate}T00:00:00`);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
      <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-amber-900">
          {pending.length} atendimento{pending.length !== 1 ? "s" : ""}{" "}
          pendente{pending.length !== 1 ? "s" : ""} de dias anteriores
        </p>
        <p className="truncate text-xs text-amber-700">
          Mais antigo:{" "}
          {format(oldestDay, "dd/MM (EEEE)", { locale: ptBR })} às{" "}
          {oldest.startTime?.slice(0, 5)}
        </p>
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="shrink-0 border-amber-300 text-amber-800 hover:bg-amber-100"
        onClick={() => onGoToDay(oldestDay)}
      >
        Ver dia
      </Button>
    </div>
  );
}
