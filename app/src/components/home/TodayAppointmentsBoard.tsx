import { useMemo } from "react";
import { useNavigate } from "react-router";
import { format } from "date-fns";
import { CalendarDays, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { STATUS_COLORS, STATUS_LABELS } from "@/components/calendar/constants";

/** Board "Agendamentos de hoje" — visão rápida do dia na Dashboard */
export default function TodayAppointmentsBoard() {
  const { salon } = useSalon();
  const navigate = useNavigate();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: appointments, isLoading } = trpc.appointment.list.useQuery(
    {
      salonId: salon?.id ?? 0,
      fromDate: today,
      toDate: today,
    },
    { enabled: !!salon }
  );

  const { data: clients } = trpc.customer.list.useQuery(
    { salonId: salon?.id ?? 0 },
    { enabled: !!salon }
  );

  const { data: services } = trpc.service.list.useQuery(
    { salonId: salon?.id ?? 0 },
    { enabled: !!salon }
  );

  const todayAppointments = useMemo(
    () =>
      [...(appointments ?? [])].sort((a, b) =>
        (a.startTime ?? "").localeCompare(b.startTime ?? "")
      ),
    [appointments]
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-4 flex flex-col items-start gap-2 space-y-0">
        <CardTitle className="text-base font-serif">
          Agendamentos de hoje
        </CardTitle>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={() => navigate("/appointments")}
        >
          <CalendarDays className="h-3.5 w-3.5" />
          Ver agenda
        </Button>
      </CardHeader>
      <CardContent className="flex-1">
        {isLoading ? (
          <Skeleton className="h-28 w-full bg-muted" />
        ) : todayAppointments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            Nenhum agendamento hoje.
          </p>
        ) : (
          <div className="space-y-2 max-h-[248px] overflow-y-auto">
            {todayAppointments.map(appt => {
              const client = clients?.find(c => c.id === appt.clientId);
              const service = services?.find(s => s.id === appt.serviceId);
              return (
                <button
                  key={appt.id}
                  type="button"
                  onClick={() => navigate("/appointments")}
                  className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 rounded-lg p-2 text-left transition-colors hover:bg-blue-50/50"
                >
                  <div className="flex w-12 shrink-0 items-center justify-center gap-1 text-xs font-semibold text-primary">
                    <Clock className="h-3 w-3" />
                    {appt.startTime?.slice(0, 5)}
                  </div>
                  <div className="min-w-0 flex-1 basis-32">
                    <p className="text-sm font-medium break-words">
                      {client?.name ?? "Cliente"}
                    </p>
                    <p className="text-xs text-muted-foreground break-words">
                      {service?.name ?? "Serviço"}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${STATUS_COLORS[appt.status] ?? ""} text-[10px] shrink-0`}
                  >
                    {STATUS_LABELS[appt.status] ?? appt.status}
                  </Badge>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
