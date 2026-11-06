import { CalendarCheck, Clock, Scissors, User } from "lucide-react";

export type BookingSummaryProps = {
  serviceName: string;
  servicePrice?: string | number | null;
  professionalName?: string | null;
  date?: string;
  startTime?: string;
  endTime?: string;
  clientName?: string;
  primaryColor: string;
};

export default function BookingSummary({
  serviceName,
  servicePrice,
  professionalName,
  date,
  startTime,
  endTime,
  clientName,
  primaryColor,
}: BookingSummaryProps) {
  const hasAnyData = serviceName || date || startTime || clientName;
  if (!hasAnyData) return null;

  const dateLabel = date
    ? new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      })
    : null;

  return (
    <div
      className="rounded-xl border p-4 space-y-3"
      style={{ borderColor: `${primaryColor}30`, backgroundColor: `${primaryColor}08` }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Resumo do agendamento
      </p>

      {serviceName && (
        <div className="flex items-start gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            <Scissors className="h-4 w-4" style={{ color: primaryColor }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{serviceName}</p>
            {servicePrice !== undefined && servicePrice !== null && (
              <p className="text-xs text-slate-500">
                R$ {String(servicePrice).replace(".", ",")}
              </p>
            )}
          </div>
        </div>
      )}

      {date && startTime && (
        <div className="flex items-start gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            <CalendarCheck className="h-4 w-4" style={{ color: primaryColor }} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800 capitalize">{dateLabel}</p>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {startTime} {endTime ? `às ${endTime}` : ""}
              {professionalName && ` • ${professionalName}`}
            </p>
          </div>
        </div>
      )}

      {clientName && (
        <div className="flex items-start gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            <User className="h-4 w-4" style={{ color: primaryColor }} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">{clientName}</p>
            <p className="text-xs text-slate-500">Cliente</p>
          </div>
        </div>
      )}
    </div>
  );
}
