import { useState, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/salon";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Scissors, CheckCircle2, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  checked_in: "bg-amber-100 text-amber-700",
  in_progress: "bg-violet-100 text-violet-700",
  completed: "bg-emerald-100 text-emerald-700",
  no_show: "bg-rose-100 text-rose-700",
  cancelled: "bg-slate-100 text-slate-700",
};

const statusLabels: Record<string, string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  checked_in: "Check-in",
  in_progress: "Em Andamento",
  completed: "Completo",
  no_show: "No-Show",
  cancelled: "Cancelado",
};

export default function Appointments() {
  const { salon } = useSalon();
  const [weekOffset, setWeekOffset] = useState(0);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    clientId: "",
    professionalId: "",
    serviceId: "",
    appointmentDate: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    notes: "",
    price: "",
  });

  const today = new Date();
  const weekStart = startOfWeek(addDays(today, weekOffset * 7), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const utils = trpc.useUtils();
  const { data: appointments, isLoading } = trpc.appointment.list.useQuery(
    {
      salonId: salon?.id ?? 0,
      fromDate: format(weekStart, "yyyy-MM-dd"),
      toDate: format(weekEnd, "yyyy-MM-dd"),
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

  const appointmentsByDay = useMemo(() => {
    const map: Record<string, typeof appointments> = {};
    weekDays.forEach((d) => {
      const key = format(d, "yyyy-MM-dd");
      map[key] = appointments?.filter((a) => a.appointmentDate && isSameDay(new Date(a.appointmentDate), d)) ?? [];
    });
    return map;
  }, [appointments, weekDays]);

  function handleCreate() {
    if (!salon) return;
    // Service removido - nao usado
    createMutation.mutate({
      salonId: salon.id,
      clientId: Number(form.clientId),
      professionalId: Number(form.professionalId),
      serviceId: Number(form.serviceId),
      appointmentDate: form.appointmentDate,
      startTime: form.startTime,
      endTime: form.startTime, // simplificado: calcular depois
      notes: form.notes || undefined,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agendamentos</h1>
          <p className="text-muted-foreground">Calendário semanal e gestão de horários</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setWeekOffset((o) => o - 1)}>Anterior</Button>
          <span className="text-sm font-medium min-w-[140px] text-center">
            {format(weekStart, "dd/MM")} - {format(weekEnd, "dd/MM")}
          </span>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset((o) => o + 1)}>Próxima</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Novo</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Novo Agendamento</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Cliente</Label>
                  <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {clients?.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Profissional</Label>
                    <Select value={form.professionalId} onValueChange={(v) => setForm({ ...form, professionalId: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {professionals?.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Serviço</Label>
                    <Select value={form.serviceId} onValueChange={(v) => setForm({ ...form, serviceId: v })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {services?.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name} - R$ {s.price}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Data</Label>
                    <Input type="date" value={form.appointmentDate} onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Horário</Label>
                    <Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Valor (R$)</Label>
                  <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0,00" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>Criar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="grid grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayAppts = appointmentsByDay[key] ?? [];
            const isToday = isSameDay(day, today);
            return (
              <div key={key} className={`border rounded-lg p-3 ${isToday ? "border-rose-300 bg-rose-50/30" : ""}`}>
                <div className="text-center mb-3">
                  <p className="text-xs text-muted-foreground uppercase">{format(day, "EEE", { locale: ptBR })}</p>
                  <p className={`text-lg font-bold ${isToday ? "text-rose-600" : ""}`}>{format(day, "dd")}</p>
                </div>
                <div className="space-y-2">
                  {dayAppts.map((appt) => (
                    <div key={appt.id} className="bg-background border rounded-md p-2 text-xs shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{appt.startTime?.slice(0, 5)}</span>
                        <Badge variant="secondary" className={statusColors[appt.status] + " text-[10px] px-1 py-0"}>
                          {statusLabels[appt.status]}
                        </Badge>
                      </div>
                      <p className="truncate">{clients?.find((c) => c.id === appt.clientId)?.name ?? "Cliente"}</p>
                      <div className="flex items-center gap-1 text-muted-foreground mt-1">
                        <Scissors className="h-3 w-3" />
                        <span className="truncate">{services?.find((s) => s.id === appt.serviceId)?.name ?? "Serviço"}</span>
                      </div>
                      {appt.status === "scheduled" && (
                        <div className="flex gap-1 mt-2">
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateMutation.mutate({ id: appt.id, salonId: salon!.id, status: "checked_in" })}>
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => updateMutation.mutate({ id: appt.id, salonId: salon!.id, status: "cancelled" })}>
                            <XCircle className="h-3 w-3 text-rose-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  {dayAppts.length === 0 && <p className="text-[10px] text-muted-foreground text-center py-2">Sem agendamentos</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
