import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import type { AppointmentFormData } from "./useAppointmentForm";
import type { Client, Professional, Service } from "@db/schema";

interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  form: AppointmentFormData;
  onFieldChange: <K extends keyof AppointmentFormData>(
    field: K,
    value: AppointmentFormData[K]
  ) => void;
  onCreate: () => void;
  isPending: boolean;
  clients?: Client[];
  professionals?: Professional[];
  services?: Service[];
}

export default function AppointmentDialog({
  open,
  onOpenChange,
  form,
  onFieldChange,
  onCreate,
  isPending,
  clients,
  professionals,
  services,
}: AppointmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              onValueChange={(v) => onFieldChange("clientId", v)}
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
                onValueChange={(v) => onFieldChange("professionalId", v)}
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
                onValueChange={(v) => onFieldChange("serviceId", v)}
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
                onChange={(e) => onFieldChange("appointmentDate", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Horário</Label>
              <Input
                type="time"
                value={form.startTime}
                onChange={(e) => onFieldChange("startTime", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Observações</Label>
            <Input
              value={form.notes}
              onChange={(e) => onFieldChange("notes", e.target.value)}
              placeholder="Opcional"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={onCreate} disabled={isPending}>
            Criar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
