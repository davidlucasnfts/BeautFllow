import { useState, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format, addDays, startOfWeek, endOfWeek } from "date-fns";
import { Plus, CalendarDays, CalendarRange } from "lucide-react";
import WeekView from "@/components/calendar/WeekView";
import DayView from "@/components/calendar/DayView";
import type { ViewMode, CalendarAppointment } from "@/components/calendar/types";

export default function Appointments() {
  const { salon } = useSalon();
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    clientId: "",
    professionalId: "",
    serviceId: "",
    appointmentDate: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    notes: "",
  });
  const [filterProfessional, setFilterProfessional] = useState<string>("all");
  const [filterService, setFilterService] = useState<string>("all");

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

  function calculateEndTime(start: string, durationMinutes: number): string {
    const [h, m] = start.split(":").map(Number);
    const totalMinutes = h * 60 + m + durationMinutes;
    const endH = Math.floor(totalMinutes / 60);
    const endM = totalMinutes % 60;
    return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agendamentos</h1>
          <p className="text-muted-foreground">
            Calendário e gestão de horários
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtros */}
          <Select value={filterProfessional} onValueChange={setFilterProfessional}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="Profissional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos profissionais</SelectItem>
              {professionals?.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color ?? "#ccc" }} />
                    {p.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterService} onValueChange={setFilterService}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="Serviço" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos serviços</SelectItem>
              {services?.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color ?? "#ccc" }} />
                    {s.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Toggle View */}
          <div className="flex items-center border rounded-md overflow-hidden">
            <Button
              variant={viewMode === "week" ? "default" : "ghost"}
              size="sm"
              className="rounded-none h-8 px-3"
              onClick={() => setViewMode("week")}
            >
              <CalendarRange className="h-4 w-4 mr-1.5" />
              Semana
            </Button>
            <Button
              variant={viewMode === "day" ? "default" : "ghost"}
              size="sm"
              className="rounded-none h-8 px-3"
              onClick={() => setViewMode("day")}
            >
              <CalendarDays className="h-4 w-4 mr-1.5" />
              Dia
            </Button>
          </div>

          {/* Navegação */}
          {viewMode === "week" ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWeekOffset((o) => o - 1)}
              >
                Anterior
              </Button>
              <span className="text-sm font-medium min-w-[140px] text-center">
                {format(weekStart, "dd/MM")} - {format(weekEnd, "dd/MM")}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWeekOffset((o) => o + 1)}
              >
                Próxima
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSelectedDate((d) => addDays(d, -1))
                }
              >
                Anterior
              </Button>
              <Input
                type="date"
                value={format(selectedDate, "yyyy-MM-dd")}
                onChange={(e) =>
                  setSelectedDate(new Date(e.target.value))
                }
                className="w-40 h-8 text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSelectedDate((d) => addDays(d, 1))
                }
              >
                Próxima
              </Button>
            </>
          )}

          {/* Novo agendamento */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> Novo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Novo Agendamento</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Cliente</Label>
                  <Select
                    value={form.clientId}
                    onValueChange={(v) =>
                      setForm({ ...form, clientId: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients?.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Profissional</Label>
                    <Select
                      value={form.professionalId}
                      onValueChange={(v) =>
                        setForm({ ...form, professionalId: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {professionals?.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Serviço</Label>
                    <Select
                      value={form.serviceId}
                      onValueChange={(v) =>
                        setForm({ ...form, serviceId: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {services?.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.name} - R$ {s.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Data</Label>
                    <Input
                      type="date"
                      value={form.appointmentDate}
                      onChange={(e) =>
                        setForm({ ...form, appointmentDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Horário</Label>
                    <Input
                      type="time"
                      value={form.startTime}
                      onChange={(e) =>
                        setForm({ ...form, startTime: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Observações</Label>
                  <Input
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    placeholder="Opcional"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                >
                  Criar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Calendar Views */}
      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : viewMode === "week" ? (
        <WeekView
          weekDays={weekDays}
          today={today}
          appointmentsByDay={appointmentsByDay as Record<string, CalendarAppointment[]>}
          clients={clients ?? []}
          services={services ?? []}
          onCheckIn={(id) =>
            updateMutation.mutate({
              id,
              salonId: salon!.id,
              status: "checked_in",
            })
          }
          onCancel={(id) =>
            updateMutation.mutate({
              id,
              salonId: salon!.id,
              status: "cancelled",
            })
          }
        />
      ) : (
        <DayView
          day={selectedDate}
          appointments={dayAppointments}
          clients={clients ?? []}
          services={services ?? []}
          professionals={professionals ?? []}
          onCheckIn={(id) =>
            updateMutation.mutate({
              id,
              salonId: salon!.id,
              status: "checked_in",
            })
          }
          onCancel={(id) =>
            updateMutation.mutate({
              id,
              salonId: salon!.id,
              status: "cancelled",
            })
          }
          onReschedule={handleReschedule}
        />
      )}
    </div>
  );
}
