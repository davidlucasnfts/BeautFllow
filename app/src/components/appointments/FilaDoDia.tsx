import { useEffect, useMemo, useRef, useState } from "react";
import {
  format,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  isSameDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  MessageCircle,
  CalendarDays,
  CheckCheck,
  Play,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  hasAppointmentActions,
} from "@/components/calendar/constants";
import type {
  CalendarAppointment,
  CalendarService,
} from "@/components/calendar/types";

/** Cliente com telefone (a query de clientes traz a linha completa) */
type FilaClient = { id: number; name: string; phone?: string | null };

interface FilaDoDiaProps {
  selectedDay: Date;
  onSelectDay: (day: Date) => void;
  appointments: CalendarAppointment[];
  services: CalendarService[];
  clients: FilaClient[];
  onStart: (id: number) => void;
  onConclude: (appt: CalendarAppointment) => void;
  onCancel: (id: number) => void;
}

/** Visão "fila de atendimento" do dia — padrão no mobile (Opção F) */
export default function FilaDoDia({
  selectedDay,
  onSelectDay,
  appointments,
  services,
  clients,
  onStart,
  onConclude,
  onCancel,
}: FilaDoDiaProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const selectedDayRef = useRef<HTMLButtonElement>(null);

  const monthDays = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfMonth(selectedDay),
        end: endOfMonth(selectedDay),
      }),
    [selectedDay]
  );

  const dayKey = format(selectedDay, "yyyy-MM-dd");

  // Entrando na aba (ou trocando de mês), a faixa rola até o dia selecionado —
  // por padrão o dia atual, já visível sem precisar deslizar
  useEffect(() => {
    selectedDayRef.current?.scrollIntoView({
      inline: "center",
      block: "nearest",
    });
  }, [dayKey]);
  const dayAppointments = useMemo(
    () =>
      appointments
        .filter(a => a.appointmentDate === dayKey)
        .sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? "")),
    [appointments, dayKey]
  );

  return (
    <div className="space-y-4">
      {/* Faixa de dias do mês — trocar de dia com 1 toque */}
      <div className="flex gap-2 overflow-x-auto scroll-smooth pb-1">
        {monthDays.map(day => {
          const selected = isSameDay(day, selectedDay);
          return (
            <button
              key={format(day, "yyyy-MM-dd")}
              ref={selected ? selectedDayRef : undefined}
              type="button"
              onClick={() => onSelectDay(day)}
              className={`flex shrink-0 flex-col items-center rounded-lg px-3 py-1.5 transition-colors ${
                selected
                  ? "bg-primary text-primary-foreground"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="text-[10px] uppercase opacity-80">
                {format(day, "EEE", { locale: ptBR })}
              </span>
              <span className="text-base font-bold leading-tight">
                {format(day, "d")}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lista do dia */}
      {dayAppointments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Nenhum agendamento neste dia.</p>
        </div>
      ) : (
        <div className="divide-y rounded-lg border">
          {dayAppointments.map(appt => {
            const client = clients.find(c => c.id === appt.clientId);
            const service = services.find(s => s.id === appt.serviceId);
            const expanded = expandedId === appt.id;
            const cancelled = appt.status === "cancelled";
            return (
              <div key={appt.id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedId(expanded ? null : appt.id)}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setExpandedId(expanded ? null : appt.id);
                    }
                  }}
                  className={`flex w-full cursor-pointer items-center gap-3 p-3 text-left transition-colors hover:bg-blue-50/50 ${
                    cancelled ? "opacity-60" : ""
                  }`}
                >
                  <div className="w-14 shrink-0 text-center">
                    <span className="text-base font-semibold text-primary">
                      {appt.startTime?.slice(0, 5)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium truncate ${
                        cancelled ? "line-through" : ""
                      }`}
                    >
                      {client?.name ?? "Cliente"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {service?.name ?? "Serviço"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge
                      variant="secondary"
                      className={`${STATUS_COLORS[appt.status] ?? ""} text-[10px]`}
                    >
                      {STATUS_LABELS[appt.status] ?? appt.status}
                    </Badge>
                    {client?.phone && (
                      <a
                        href={`https://wa.me/55${client.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1 rounded-md bg-green-600 px-1.5 py-0.5 text-[10px] font-semibold text-white transition-colors hover:bg-green-700"
                      >
                        <MessageCircle className="h-3 w-3" />
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>

                {/* Barra de ações (toque na linha expande) — hierarquia de peso:
                    Iniciar = tema sólido, Concluir = verde sólido, Cancelar = outline */}
                {expanded && hasAppointmentActions(appt) && (
                  <div className="flex justify-end gap-2 px-3 pb-3">
                    {(appt.status === "scheduled" ||
                      appt.status === "confirmed") && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          onStart(appt.id);
                        }}
                        className="h-8 gap-1.5 bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                      >
                        <Play className="h-3.5 w-3.5" />
                        Iniciar
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        onConclude(appt);
                      }}
                      className="h-8 gap-1.5 bg-green-600 px-3 text-xs font-semibold text-white hover:bg-green-700"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Concluir
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={e => {
                        e.stopPropagation();
                        onCancel(appt.id);
                      }}
                      className="h-8 gap-1.5 border-red-600 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-600"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
