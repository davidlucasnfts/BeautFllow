import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { CalendarClock, CalendarPlus, X } from "lucide-react";
import { format } from "date-fns";
import { saveFollowUpPrefill } from "@/components/appointments/followUpPrefill";

function dueLabel(dueDate: string): { text: string; overdue: boolean } {
  const today = format(new Date(), "yyyy-MM-dd");
  if (dueDate === today) return { text: "hoje", overdue: false };
  const diff = Math.round(
    (new Date(`${dueDate}T00:00:00`).getTime() -
      new Date(`${today}T00:00:00`).getTime()) /
      86400000
  );
  return diff < 0
    ? { text: `há ${Math.abs(diff)} dia${Math.abs(diff) > 1 ? "s" : ""}`, overdue: true }
    : { text: `em ${diff} dia${diff > 1 ? "s" : ""}`, overdue: false };
}

/** Retornos pós-procedimento pendentes — "Agendar" leva pra agenda pré-preenchida */
export default function FollowUpsBoard() {
  const { salon } = useSalon();
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const { data: followUps, isLoading } = trpc.followup.list.useQuery(
    { salonId: salon?.id ?? 0 },
    { enabled: !!salon }
  );

  const dismissMutation = trpc.followup.dismiss.useMutation({
    onSuccess: () => {
      utils.followup.list.invalidate();
      toast.success("Retorno dispensado");
    },
    onError: e => toast.error(e.message),
  });

  function handleSchedule(fu: NonNullable<typeof followUps>[number]) {
    saveFollowUpPrefill({
      clientId: fu.clientId,
      professionalId: fu.professionalId,
      serviceId: fu.serviceId,
      date: fu.dueDate,
      followUpId: fu.id,
    });
    navigate("/appointments");
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-base font-serif">
          Retornos pendentes
          {(followUps?.length ?? 0) > 0 && (
            <span className="text-xs font-normal text-muted-foreground">
              ({followUps?.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-24 w-full bg-muted" />
        ) : (followUps ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum retorno pendente.
          </p>
        ) : (
          <div className="space-y-2 max-h-[248px] overflow-y-auto">
            {followUps?.map(fu => {
              const due = dueLabel(fu.dueDate);
              return (
                <div
                  key={fu.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg p-2 hover:bg-blue-50/50 transition-colors"
                >
                  <div className="flex w-12 shrink-0 items-center justify-center gap-1 text-xs font-semibold text-primary">
                    <CalendarClock className="h-3 w-3" />
                    {format(new Date(`${fu.dueDate}T00:00:00`), "dd/MM")}
                  </div>
                  <div className="min-w-0 flex-1 basis-32">
                    <p className="text-sm font-medium break-words">
                      {fu.clientName}
                    </p>
                    <p className="text-xs text-muted-foreground break-words">
                      {fu.serviceName}
                      <span
                        className={
                          due.overdue ? "text-rose-500 font-medium" : ""
                        }
                      >
                        {" "}
                        · {due.text}
                      </span>
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => handleSchedule(fu)}
                      className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      <CalendarPlus className="h-3 w-3" />
                      Agendar
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        salon &&
                        dismissMutation.mutate({ id: fu.id, salonId: salon.id })
                      }
                      className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <X className="h-3 w-3" />
                      Dispensar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
