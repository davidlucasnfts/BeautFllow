import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Scissors, CheckCircle2, XCircle, Clock, User, Phone, Mail } from "lucide-react";
import { STATUS_COLORS, STATUS_LABELS } from "./constants";
import type {
  CalendarAppointment,
  CalendarClient,
  CalendarService,
  CalendarProfessional,
} from "./types";

interface EventCardProps {
  appt: CalendarAppointment;
  client?: CalendarClient;
  service?: CalendarService;
  professional?: CalendarProfessional;
  onCheckIn: (id: number) => void;
  onCancel: (id: number) => void;
  onReschedule?: (appointmentId: number, newStartTime: string) => void;
  variant?: "week" | "day";
}

export default function EventCard({
  appt,
  client,
  service,
  professional,
  onCheckIn,
  onCancel,
  onReschedule,
  variant = "week",
}: EventCardProps) {
  const isDay = variant === "day";
  const serviceColor = service?.color ?? null;

  const cardStyle = serviceColor
    ? {
        backgroundColor: isDay
          ? `${serviceColor}18`
          : `${serviceColor}15`,
        borderLeft: isDay
          ? `4px solid ${serviceColor}`
          : `3px solid ${serviceColor}`,
      }
    : undefined;

  return (
    <div
      className={`border rounded-md shadow-sm ${
        isDay ? "p-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow" : "p-2 text-xs"
      }`}
      style={cardStyle}
      draggable={!!onReschedule && isDay}
      onDragStart={(e) => {
        if (onReschedule && isDay) {
          e.dataTransfer.setData("appointmentId", String(appt.id));
          e.dataTransfer.setData("durationMinutes", String(service?.durationMinutes ?? 60));
          e.dataTransfer.effectAllowed = "move";
        }
      }}
    >
      <div className={`flex ${isDay ? "items-start justify-between gap-2" : "items-center justify-between mb-1"}`}>
        <div className="min-w-0 flex-1">
          {/* Horário + Status */}
          <div className={`flex items-center ${isDay ? "gap-1.5 mb-0.5" : "gap-1 mb-1"}`}>
            {isDay && <Clock className="h-3 w-3 text-muted-foreground shrink-0" />}
            <span className={`font-semibold ${isDay ? "text-xs" : "font-medium"}`}>
              {appt.startTime?.slice(0, 5)}
              {isDay && appt.endTime ? ` - ${appt.endTime.slice(0, 5)}` : ""}
            </span>
            <Badge
              variant="secondary"
              className={
                STATUS_COLORS[appt.status] +
                (isDay ? " text-[10px] px-1 py-0 h-4" : " text-[10px] px-1 py-0")
              }
            >
              {STATUS_LABELS[appt.status]}
            </Badge>
          </div>

          {/* Nome do cliente */}
          <p className={`font-medium truncate ${isDay ? "text-sm leading-tight" : ""}`}>
            {client?.name ?? "Cliente"}
          </p>

          {/* Serviço + Profissional */}
          <div className={`flex items-center ${isDay ? "gap-3 mt-1" : "gap-1 text-muted-foreground mt-1"}`}>
            <div className={`flex items-center gap-1 ${isDay ? "text-muted-foreground" : ""}`}>
              <Scissors className={`shrink-0 ${isDay ? "h-3 w-3" : "h-3 w-3"}`} />
              <span className={`truncate ${isDay ? "text-xs" : ""}`}>
                {service?.name ?? "Serviço"}
              </span>
            </div>
            {professional && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex items-center gap-1 ${isDay ? "text-muted-foreground" : ""} cursor-help`}>
                      <User className={`shrink-0 ${isDay ? "h-3 w-3" : "h-3 w-3"}`} />
                      <span className={`truncate ${isDay ? "text-xs" : ""}`}>
                        {professional.name}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="p-3 max-w-[220px]">
                    <ProfessionalPreview professional={professional} />
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* Ações */}
        {appt.status === "scheduled" && (
          <div className={`flex gap-0.5 shrink-0 ${isDay ? "" : "mt-2"}`}>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onCheckIn(appt.id);
              }}
            >
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onCancel(appt.id);
              }}
            >
              <XCircle className="h-3 w-3 text-rose-500" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfessionalPreview({
  professional,
}: {
  professional: CalendarProfessional;
}) {
  const initials = professional.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback
            className="text-xs font-medium"
            style={{
              backgroundColor: professional.color ? `${professional.color}30` : undefined,
              color: professional.color ?? undefined,
            }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{professional.name}</p>
          <p className="text-xs text-muted-foreground">Profissional</p>
        </div>
      </div>
      {professional.phone && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Phone className="h-3 w-3" />
          <span>{professional.phone}</span>
        </div>
      )}
      {professional.email && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Mail className="h-3 w-3" />
          <span>{professional.email}</span>
        </div>
      )}
    </div>
  );
}
