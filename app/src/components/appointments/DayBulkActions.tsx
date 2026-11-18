import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCheck, Play, XCircle } from "lucide-react";
import type {
  CalendarAppointment,
  CalendarService,
} from "@/components/calendar/types";
import { moneyDotToBR } from "@/lib/input-masks";

const START_STATUSES = ["scheduled", "confirmed", "checked_in"];
const ACTIVE_STATUSES = [...START_STATUSES, "in_progress"];

type BulkAction = "start" | "conclude" | "cancel";

interface DayBulkActionsProps {
  /** Atendimentos do período já filtrados (profissional/serviço ativos na tela) */
  appointments: CalendarAppointment[];
  /** Lista completa de serviços (tipo real é Service do schema, com price) */
  services: Array<CalendarService & { price?: string | number | null }>;
  /** Escopo exibido nos textos: "do dia" (visão Dia) ou "da semana" (visão Semana) */
  scope: "day" | "week";
}

/** Ações em massa do dia: Iniciar todos, Concluir todos (gera o financeiro
 *  de cada um com comissão calculada) e Cancelar todos. Respeita os filtros
 *  ativos da agenda (ex.: filtrar por profissional e concluir só os dele).
 *  "Concluir todos" só aparece com o fechamento automático ligado —
 *  quem prefere revisar cada checkout continua no fluxo manual. */
export default function DayBulkActions({
  appointments,
  services,
  scope,
}: DayBulkActionsProps) {
  const { salon } = useSalon();
  const utils = trpc.useUtils();
  const [confirm, setConfirm] = useState<BulkAction | null>(null);
  const [running, setRunning] = useState(false);

  const auto = salon?.autoCheckout.enabled === true;

  const toStart = appointments.filter(a => START_STATUSES.includes(a.status));
  const toConclude = appointments.filter(a => a.status === "in_progress");
  const toCancel = appointments.filter(a => ACTIVE_STATUSES.includes(a.status));

  // Total estimado que o "Concluir todos" vai lançar no financeiro
  const concludeTotal = toConclude
    .reduce((acc, a) => {
      const service = services.find(s => s.id === a.serviceId);
      const extrasTotal = (a.extraServices ?? []).reduce(
        (e, x) => e + Number(x.price),
        0
      );
      return acc + Number(service?.price ?? 0) + extrasTotal;
    }, 0)
    .toFixed(2);

  const updateMutation = trpc.appointment.update.useMutation();
  const concludeMutation = trpc.appointment.conclude.useMutation();

  if (!salon || (toStart.length === 0 && toConclude.length === 0)) return null;

  function invalidateAll() {
    utils.appointment.list.invalidate();
    utils.financial.list.invalidate();
    utils.financial.summary.invalidate();
    utils.dashboard.metrics.invalidate();
  }

  async function run(action: BulkAction) {
    if (!salon) return;
    setRunning(true);
    try {
      if (action === "conclude") {
        const results = await Promise.allSettled(
          toConclude.map(a =>
            concludeMutation.mutateAsync({ id: a.id, salonId: salon.id })
          )
        );
        const ok = results.filter(r => r.status === "fulfilled").length;
        const fail = results.length - ok;
        invalidateAll();
        toast.success(
          fail > 0
            ? `${ok} atendimento(s) concluído(s), ${fail} com erro (confira na lista).`
            : `${ok} atendimento(s) concluído(s) — financeiro gerado.`
        );
      } else {
        const status = action === "start" ? "in_progress" : "cancelled";
        const results = await Promise.allSettled(
          (action === "start" ? toStart : toCancel).map(a =>
            updateMutation.mutateAsync({ id: a.id, salonId: salon.id, status })
          )
        );
        const ok = results.filter(r => r.status === "fulfilled").length;
        const fail = results.length - ok;
        invalidateAll();
        toast.success(
          fail > 0
            ? `${ok} atendimento(s) atualizado(s), ${fail} com erro (confira na lista).`
            : action === "start"
              ? `${ok} atendimento(s) iniciado(s).`
              : `${ok} atendimento(s) cancelado(s).`
        );
      }
    } finally {
      setRunning(false);
      setConfirm(null);
    }
  }

  // No mobile: rótulo em cima, botões empilhados em largura total.
  // No desktop: tudo numa linha (rótulo + botões à esquerda).
  const btnClass = "h-9 sm:h-8 w-full sm:w-auto gap-1.5 px-3 text-xs font-semibold justify-center";

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-muted/40 px-3 py-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
      <span className="text-xs font-medium text-muted-foreground">
        {scope === "day" ? "Ações do dia:" : "Ações da semana:"}
      </span>
      {toStart.length > 0 && (
        <Button
          type="button"
          size="sm"
          onClick={() => setConfirm("start")}
          disabled={running}
          className={`${btnClass} bg-primary text-primary-foreground hover:bg-primary/90`}
        >
          <Play className="h-3.5 w-3.5" />
          Iniciar todos ({toStart.length})
        </Button>
      )}
      {auto && toConclude.length > 0 && (
        <Button
          type="button"
          size="sm"
          onClick={() => setConfirm("conclude")}
          disabled={running}
          className={`${btnClass} bg-green-600 text-white hover:bg-green-700`}
        >
          <CheckCheck className="h-3.5 w-3.5" />
          Concluir todos ({toConclude.length})
        </Button>
      )}
      {toCancel.length > 0 && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setConfirm("cancel")}
          disabled={running}
          className={`${btnClass} border-red-600 text-red-600 hover:bg-red-50 hover:text-red-600`}
        >
          <XCircle className="h-3.5 w-3.5" />
          Cancelar todos ({toCancel.length})
        </Button>
      )}

      <AlertDialog open={!!confirm} onOpenChange={open => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === "start" && `Iniciar ${toStart.length} atendimento(s)?`}
              {confirm === "conclude" && `Concluir ${toConclude.length} atendimento(s)?`}
              {confirm === "cancel" && `Cancelar ${toCancel.length} atendimento(s)?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === "start" &&
                `Todos os atendimentos agendados ${scope === "day" ? "do dia" : "da semana"} vão para 'Em andamento'.`}
              {confirm === "conclude" &&
                `O financeiro será gerado para cada um com a comissão do profissional calculada. Total estimado: R$ ${moneyDotToBR(concludeTotal)}.`}
              {confirm === "cancel" &&
                `Todos os atendimentos ativos ${scope === "day" ? "do dia" : "da semana"} serão cancelados. Cada um poderá ser reagendado depois, individualmente.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={running}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={e => {
                e.preventDefault();
                if (confirm) void run(confirm);
              }}
              disabled={running}
              className={
                confirm === "cancel"
                  ? "bg-red-600 hover:bg-red-700"
                  : confirm === "conclude"
                    ? "bg-green-600 hover:bg-green-700"
                    : undefined
              }
            >
              {running ? "Executando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
