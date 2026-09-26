import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import DatePicker from "@/components/DatePicker";
import { ClientCombobox } from "@/components/clients/ClientCombobox";
import { ServiceMultiSelect } from "./ServiceMultiSelect";
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
  availableSlots?: string[];
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
  availableSlots,
}: AppointmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Cliente</Label>
            <ClientCombobox
              clients={clients}
              value={form.clientId}
              onChange={v => onFieldChange("clientId", v)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Profissional</Label>
              <Select
                value={form.professionalId}
                onValueChange={v => onFieldChange("professionalId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="z-[60]">
                  {professionals?.map(p => (
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
                onValueChange={v => {
                  onFieldChange("serviceId", v);
                  // o serviço principal não pode aparecer como adicional
                  onFieldChange(
                    "extraServiceIds",
                    form.extraServiceIds.filter(id => id !== v)
                  );
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="z-[60]">
                  {services?.map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name} - R$ {s.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Serviços adicionais (opcional)</Label>
            <ServiceMultiSelect
              services={services}
              selectedIds={form.extraServiceIds}
              onChange={ids => onFieldChange("extraServiceIds", ids)}
              excludeIds={form.serviceId ? [form.serviceId] : []}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Data</Label>
              <DatePicker
                value={form.appointmentDate}
                onChange={iso => onFieldChange("appointmentDate", iso)}
                placeholder="Escolha a data"
                minDate={new Date()}
              />
            </div>
            <div className="grid gap-2">
              <Label>Horário</Label>
              <Select
                value={
                  availableSlots?.includes(form.startTime) ? form.startTime : ""
                }
                onValueChange={v => onFieldChange("startTime", v)}
                disabled={!form.appointmentDate}
              >
                <SelectTrigger>
                  <SelectValue
                    className="truncate"
                    placeholder={
                      !form.appointmentDate
                        ? "Escolha a data"
                        : availableSlots && availableSlots.length === 0
                          ? "Sem horários"
                          : "Selecione"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="z-[60]">
                  {(availableSlots ?? []).map(slot => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Observações</Label>
            <Input
              value={form.notes}
              onChange={e => onFieldChange("notes", e.target.value)}
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
