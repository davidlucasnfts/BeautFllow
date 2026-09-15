import { useState, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  format,
  addDays,
  addMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import WeekView from "@/components/calendar/WeekView";
import DayView from "@/components/calendar/DayView";
import MonthView from "@/components/calendar/MonthView";
import AppointmentFilters from "@/components/appointments/AppointmentFilters";
import AppointmentDialog from "@/components/appointments/AppointmentDialog";
import FilaDoDia from "@/components/appointments/FilaDoDia";
import CheckoutDialog, {
  type CheckoutTarget,
} from "@/components/appointments/CheckoutDialog";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import { useAppointmentForm } from "@/components/appointments/useAppointmentForm";
import { generateTimeSlots, filterAvailableSlots } from "@/lib/time-slots";
import type {
  ViewMode,
  CalendarAppointment,
  CalendarService,
} from "@/components/calendar/types";

export default function Appointments() {
  const { salon } = useSalon();
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filaDate, setFilaDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [open, setOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<{
    id: number;
    label: string;
  } | null>(null);
  const [checkoutTarget, setCheckoutTarget] = useState<CheckoutTarget | null>(
    null
  );
  const [filterProfessional, setFilterProfessional] = useState<string>("all");
  const [filterService, setFilterService] = useState<string>("all");

  const { form, updateField, resetForm } = useAppointmentForm();

  const today = new Date();
  const weekStart = startOfWeek(addDays(today, weekOffset * 7), {
    weekStartsOn: 1,
  });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const monthCursor = addMonths(today, monthOffset);
  const monthDays = Array.from({ length: 42 }, (_, i) =>
    addDays(startOfWeek(startOfMonth(monthCursor), { weekStartsOn: 1 }), i)
  );

  const utils = trpc.useUtils();

  // Mobile na visão "dia" traz o mês inteiro (a fila troca de dia com 1 toque);
  // demais visões usam o intervalo correspondente (semana / dia / mês)
  const queryRange =
    isMobile && viewMode === "day"
      ? {
          from: format(startOfMonth(filaDate), "yyyy-MM-dd"),
          to: format(endOfMonth(filaDate), "yyyy-MM-dd"),
        }
      : viewMode === "week"
        ? {
            from: format(weekStart, "yyyy-MM-dd"),
            to: format(weekEnd, "yyyy-MM-dd"),
          }
        : viewMode === "month"
          ? {
              from: format(startOfMonth(monthCursor), "yyyy-MM-dd"),
              to: format(endOfMonth(monthCursor), "yyyy-MM-dd"),
            }
          : {
              from: format(selectedDate, "yyyy-MM-dd"),
              to: format(selectedDate, "yyyy-MM-dd"),
            };

  const { data: appointments, isLoading } = trpc.appointment.list.useQuery(
    {
      salonId: salon?.id ?? 0,
      fromDate: queryRange.from,
      toDate: queryRange.to,
    },
    { enabled: !!salon }
  );

  const { data: clients } = trpc.customer.list.useQuery(
    { salonId: salon?.id ?? 0 },
    { enabled: !!salon }
  );

  const { data: professionals } = trpc.professional.list.useQuery(
    { salonId: salon?.id ?? 0 },
    { enabled: !!salon }
  );

  // Traz ativos e inativos: atendimentos antigos precisam exibir o nome do
  // serviço mesmo depois de ele ser "excluído" (exclusão é lógica)
  const { data: services } = trpc.service.list.useQuery(
    { salonId: salon?.id ?? 0, includeInactive: true },
    { enabled: !!salon }
  );

  // Para NOVOS agendamentos só vale serviço ativo
  const activeServices = useMemo(
    () => (services ?? []).filter(s => s.isActive),
    [services]
  );

  // Agenda do dia escolhido no formulário (para esconder horários ocupados)
  const { data: formDayAppointments } = trpc.appointment.list.useQuery(
    {
      salonId: salon?.id ?? 0,
      fromDate: form.appointmentDate,
      toDate: form.appointmentDate,
    },
    { enabled: !!salon && open && !!form.appointmentDate }
  );

  const formService = activeServices.find(s => s.id === Number(form.serviceId));
  const busyIntervals = (formDayAppointments ?? [])
    .filter(
      a => a.status !== "cancelled" && a.status !== "no_show" && a.endTime
    )
    .filter(
      a =>
        !form.professionalId || a.professionalId === Number(form.professionalId)
    )
    .map(a => ({ start: a.startTime, end: a.endTime as string }));
  const availableSlots = filterAvailableSlots(
    generateTimeSlots(
      salon?.schedule.dayStart,
      salon?.schedule.dayEnd,
      salon?.schedule.slotMinutes
    ),
    busyIntervals,
    formService?.durationMinutes ?? 30
  );

  const createMutation = trpc.appointment.create.useMutation({
    onSuccess: () => {
      utils.appointment.list.invalidate();
      setOpen(false);
      resetForm();
      toast.success("Agendamento criado");
    },
    onError: e => toast.error(e.message),
  });

  const updateMutation = trpc.appointment.update.useMutation({
    onSuccess: () => {
      utils.appointment.list.invalidate();
      toast.success("Situação atualizada");
    },
    onError: e => toast.error(e.message),
  });

  function handleStart(id: number) {
    if (!salon) return;
    updateMutation.mutate({ id, salonId: salon.id, status: "in_progress" });
  }

  function handleConclude(appt: CalendarAppointment) {
    const client = clients?.find(c => c.id === appt.clientId);
    const service = services?.find(s => s.id === appt.serviceId);
    const professional = professionals?.find(p => p.id === appt.professionalId);
    setCheckoutTarget({
      appointment: appt,
      clientId: appt.clientId,
      clientName: client?.name ?? "Cliente",
      serviceName: service?.name ?? "Serviço",
      professionalId: appt.professionalId,
      professionalName: professional?.name ?? null,
      defaultAmount: service?.price ?? "0.00",
    });
  }

  function handleCancel(id: number) {
    const appt = appointments?.find(a => a.id === id);
    const client = clients?.find(c => c.id === appt?.clientId);
    setCancelTarget({
      id,
      label: client?.name
        ? `${client.name} às ${appt?.startTime?.slice(0, 5) ?? ""}`
        : `agendamento #${id}`,
    });
  }

  function calculateEndTime(start: string, durationMinutes: number): string {
    const [h, m] = start.split(":").map(Number);
    const totalMinutes = h * 60 + m + durationMinutes;
    const endH = Math.floor(totalMinutes / 60);
    const endM = totalMinutes % 60;
    return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
  }

  function handleReschedule(appointmentId: number, newStartTime: string) {
    if (!salon) return;
    const appt = appointments?.find(a => a.id === appointmentId);
    if (!appt) return;
    const service = services?.find(s => s.id === appt.serviceId);
    const endTime = service
      ? calculateEndTime(newStartTime, service.durationMinutes)
      : newStartTime;
    updateMutation.mutate({
      id: appointmentId,
      salonId: salon.id,
      startTime: newStartTime,
      endTime,
    });
    toast.success("Agendamento reagendado");
  }

  function handleCreate() {
    if (!salon) return;
    if (!form.appointmentDate) {
      toast.error("Escolha uma data para o agendamento.");
      return;
    }
    const service = services?.find(s => s.id === Number(form.serviceId));
    const endTime = service
      ? calculateEndTime(form.startTime, service.durationMinutes)
      : form.startTime;

    createMutation.mutate({
      salonId: salon.id,
      clientId: Number(form.clientId),
      professionalId: Number(form.professionalId),
      serviceId: Number(form.serviceId),
      appointmentDate: form.appointmentDate,
      startTime: form.startTime,
      endTime,
      notes: form.notes || undefined,
    });
  }

  const filteredAppointments = useMemo(() => {
    return (
      appointments?.filter(a => {
        if (
          filterProfessional !== "all" &&
          a.professionalId !== Number(filterProfessional)
        )
          return false;
        if (filterService !== "all" && a.serviceId !== Number(filterService))
          return false;
        return true;
      }) ?? []
    ).sort(
      (a, b) =>
        a.appointmentDate.localeCompare(b.appointmentDate) ||
        (a.startTime ?? "").localeCompare(b.startTime ?? "")
    );
  }, [appointments, filterProfessional, filterService]);

  const appointmentsByDay = useMemo(() => {
    const map: Record<string, typeof appointments> = {};
    weekDays.forEach(d => {
      const key = format(d, "yyyy-MM-dd");
      map[key] = filteredAppointments.filter(a => a.appointmentDate === key);
    });
    return map;
  }, [filteredAppointments, weekDays]);

  const monthAppointmentsByDay = useMemo(() => {
    const map: Record<string, typeof appointments> = {};
    monthDays.forEach(d => {
      const key = format(d, "yyyy-MM-dd");
      map[key] = filteredAppointments.filter(a => a.appointmentDate === key);
    });
    return map;
  }, [filteredAppointments, monthDays]);

  const dayAppointments = useMemo(() => {
    const key = format(selectedDate, "yyyy-MM-dd");
    return filteredAppointments.filter(a => a.appointmentDate === key);
  }, [filteredAppointments, selectedDate]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agendamentos</h1>
          <p className="text-muted-foreground">Sua agenda de atendimentos</p>
        </div>
        <div className="flex items-start">
          <AppointmentFilters
            viewMode={viewMode}
            setViewMode={setViewMode}
            weekOffset={weekOffset}
            setWeekOffset={setWeekOffset}
            monthOffset={monthOffset}
            setMonthOffset={setMonthOffset}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            filterProfessional={filterProfessional}
            setFilterProfessional={setFilterProfessional}
            filterService={filterService}
            setFilterService={setFilterService}
            professionals={professionals}
            services={services}
            onNew={() => setOpen(true)}
          />
          <AppointmentDialog
            open={open}
            onOpenChange={v => {
              if (v) {
                // abrindo: formulário sempre limpo; a data inicial segue o
                // contexto (dia selecionado na fila no mobile, hoje no desktop)
                resetForm();
                updateField(
                  "appointmentDate",
                  format(isMobile ? filaDate : new Date(), "yyyy-MM-dd")
                );
              }
              setOpen(v);
            }}
            form={form}
            onFieldChange={updateField}
            onCreate={handleCreate}
            isPending={createMutation.isPending}
            clients={clients}
            professionals={professionals}
            services={activeServices}
            availableSlots={availableSlots}
          />
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full bg-muted" />
      ) : viewMode === "day" ? (
        isMobile ? (
          <FilaDoDia
            selectedDay={filaDate}
            onSelectDay={setFilaDate}
            appointments={(appointments ?? []) as CalendarAppointment[]}
            services={(services ?? []) as CalendarService[]}
            clients={clients ?? []}
            onStart={handleStart}
            onConclude={handleConclude}
            onCancel={handleCancel}
          />
        ) : (
          <DayView
            day={selectedDate}
            appointments={dayAppointments}
            clients={clients ?? []}
            services={services ?? []}
            professionals={professionals ?? []}
            onStart={handleStart}
            onConclude={handleConclude}
            onCancel={handleCancel}
            onReschedule={handleReschedule}
          />
        )
      ) : viewMode === "week" ? (
        <WeekView
          weekDays={weekDays}
          today={today}
          appointmentsByDay={
            appointmentsByDay as Record<string, CalendarAppointment[]>
          }
          clients={clients ?? []}
          services={services ?? []}
          onStart={handleStart}
          onConclude={handleConclude}
          onCancel={handleCancel}
        />
      ) : (
        <MonthView
          monthDays={monthDays}
          cursorMonth={monthCursor}
          today={today}
          appointmentsByDay={
            monthAppointmentsByDay as Record<string, CalendarAppointment[]>
          }
          clients={clients ?? []}
          onSelectDay={day => {
            setSelectedDate(() => day);
            if (isMobile) setFilaDate(day);
            setViewMode("day");
          }}
        />
      )}

      <CheckoutDialog
        target={checkoutTarget}
        onOpenChange={open => !open && setCheckoutTarget(null)}
      />

      <ConfirmDeleteDialog
        open={!!cancelTarget}
        onOpenChange={open => !open && setCancelTarget(null)}
        itemType="agendamento"
        itemName={cancelTarget?.label ?? ""}
        onConfirm={() => {
          if (salon && cancelTarget) {
            updateMutation.mutate({
              id: cancelTarget.id,
              salonId: salon.id,
              status: "cancelled",
            });
            setCancelTarget(null);
          }
        }}
      />
    </div>
  );
}
