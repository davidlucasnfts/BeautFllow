import { useState, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format, addDays, startOfWeek, endOfWeek } from "date-fns";
import WeekView from "@/components/calendar/WeekView";
import DayView from "@/components/calendar/DayView";
import AppointmentFilters from "@/components/appointments/AppointmentFilters";
import AppointmentDialog from "@/components/appointments/AppointmentDialog";
import { useAppointmentForm } from "@/components/appointments/useAppointmentForm";
import type { ViewMode, CalendarAppointment } from "@/components/calendar/types";

export default function Appointments() {
  const { salon } = useSalon();
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const [open, setOpen] = useState(false);
  const [filterProfessional, setFilterProfessional] = useState<string>("all");
  const [filterService, setFilterService] = useState<string>("all");

  const { form, updateField, resetForm } = useAppointmentForm();

  const today = new Date();
  const weekStart = startOfWeek(addDays(today, weekOffset * 7), {
    weekStartsOn: 1,
  });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const utils = trpc.useUtils();

  const { data: appointments, isLoading } = trpc.appointment.list.useQuery(
    {
      salonId: salon?.id ?? 0,
      fromDate:
        viewMode === "week"
          ? format(weekStart, "yyyy-MM-dd")
          : format(selectedDate, "yyyy-MM-dd"),
      toDate:
        viewMode === "week"
          ? format(weekEnd, "yyyy-MM-dd")
          : format(selectedDate, "yyyy-MM-dd"),
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

  const { data: services } = trpc.service.list.useQuery(
    { salonId: salon?.id ?? 0 },
    { enabled: !!salon }
  );

  const createMutation = trpc.appointment.create.useMutation({
    onSuccess: () => {
      utils.appointment.list.invalidate();
      setOpen(false);
      resetForm();
      toast.success("Agendamento criado");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.appointment.update.useMutation({
    onSuccess: () => {
      utils.appointment.list.invalidate();
      toast.success("Status atualizado");
    },
    onError: (e) => toast.error(e.message),
  });

  function calculateEndTime(start: string, durationMinutes: number): string {
    const [h, m] = start.split(":").map(Number);
    const totalMinutes = h * 60 + m + durationMinutes;
    const endH = Math.floor(totalMinutes / 60);
    const endM = totalMinutes % 60;
    return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
  }

  function handleReschedule(appointmentId: number, newStartTime: string) {
    if (!salon) return;
    const appt = appointments?.find((a) => a.id === appointmentId);
    if (!appt) return;
    const service = services?.find((s) => s.id === appt.serviceId);
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
    const service = services?.find((s) => s.id === Number(form.serviceId));
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
    return appointments?.filter((a) => {
      if (filterProfessional !== "all" && a.professionalId !== Number(filterProfessional)) return false;
      if (filterService !== "all" && a.serviceId !== Number(filterService)) return false;
      return true;
    }) ?? [];
  }, [appointments, filterProfessional, filterService]);

  const appointmentsByDay = useMemo(() => {
    const map: Record<string, typeof appointments> = {};
    weekDays.forEach((d) => {
      const key = format(d, "yyyy-MM-dd");
      map[key] = filteredAppointments.filter((a) => a.appointmentDate === key);
    });
    return map;
  }, [filteredAppointments, weekDays]);

  const dayAppointments = useMemo(() => {
    const key = format(selectedDate, "yyyy-MM-dd");
    return filteredAppointments.filter((a) => a.appointmentDate === key);
  }, [filteredAppointments, selectedDate]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agendamentos</h1>
          <p className="text-muted-foreground">
            Calendário e gestão de horários
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <AppointmentFilters
            viewMode={viewMode}
            setViewMode={setViewMode}
            weekOffset={weekOffset}
            setWeekOffset={setWeekOffset}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            filterProfessional={filterProfessional}
            setFilterProfessional={setFilterProfessional}
            filterService={filterService}
            setFilterService={setFilterService}
            professionals={professionals}
            services={services}
          />
          <AppointmentDialog
            open={open}
            onOpenChange={setOpen}
            form={form}
            onFieldChange={updateField}
            onCreate={handleCreate}
            isPending={createMutation.isPending}
            clients={clients}
            professionals={professionals}
            services={services}
          />
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : viewMode === "week" ? (
        <WeekView
          weekDays={weekDays}
          today={today}
          appointmentsByDay={appointmentsByDay as Record<string, CalendarAppointment[]>}
          clients={clients ?? []}
          services={services ?? []}
          onCheckIn={(id) => {
            if (!salon) return;
            updateMutation.mutate({
              id,
              salonId: salon.id,
              status: "checked_in",
            });
          }}
          onCancel={(id) => {
            if (!salon) return;
            updateMutation.mutate({
              id,
              salonId: salon.id,
              status: "cancelled",
            });
          }}
        />
      ) : (
        <DayView
          day={selectedDate}
          appointments={dayAppointments}
          clients={clients ?? []}
          services={services ?? []}
          professionals={professionals ?? []}
          onCheckIn={(id) => {
            if (!salon) return;
            updateMutation.mutate({
              id,
              salonId: salon.id,
              status: "checked_in",
            });
          }}
          onCancel={(id) => {
            if (!salon) return;
            updateMutation.mutate({
              id,
              salonId: salon.id,
              status: "cancelled",
            });
          }}
          onReschedule={handleReschedule}
        />
      )}
    </div>
  );
}
