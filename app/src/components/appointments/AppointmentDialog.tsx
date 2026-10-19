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
import { ShieldAlert } from "lucide-react";
import { useState } from "react";
import ClientQuickCreate from "@/components/clients/ClientQuickCreate";
import OnboardingChecklist from "@/components/appointments/OnboardingChecklist";
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
  /** termos ativos que o cliente escolhido ainda não assinou (serviço exige) */
  unsignedConsentCount?: number;
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
  unsignedConsentCount = 0,
}: AppointmentDialogProps) {
  const [creatingClient, setCreatingClient] = useState(false);
  const [quickClientName, setQuickClientName] = useState("");

  const hasNoClients = (clients?.length ?? 0) === 0;
  const hasNoServices = (services?.length ?? 0) === 0;
  const hasNoProfessionals = (professionals?.length ?? 0) === 0;
  const showSetup = hasNoClients || hasNoServices || hasNoProfessionals;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Novo Agendamento</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 overflow-y-auto min-h-0">
          {showSetup && (
            <OnboardingChecklist
              compact
              clientCount={clients?.length ?? 0}
              serviceCount={services?.length ?? 0}
              professionalCount={professionals?.length ?? 0}
              onCreateClient={() => {
                setQuickClientName("");
                setCreatingClient(true);
              }}
            />
          )}

          <div className="grid gap-2">
            <Label>Cliente</Label>
            {creatingClient ? (
              <ClientQuickCreate
                initialName={quickClientName}
                onCreated={id => {
                  onFieldChange("clientId", id);
                  setCreatingClient(false);
                  setQuickClientName("");
                }}
                onCancel={() => {
                  setCreatingClient(false);
                  setQuickClientName("");
                }}
              />
            ) : (
              <ClientCombobox
                clients={clients}
                value={form.clientId}
                onChange={v => onFieldChange("clientId", v)}
                onCreate={name => {
                  setQuickClientName(name);
                  setCreatingClient(true);
                }}
              />
            )}
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

          {unsignedConsentCount > 0 && (
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <p>
                Este serviço exige termo de autorização assinado.{" "}
                {unsignedConsentCount === 1
                  ? "O cliente ainda não assinou 1 termo ativo."
                  : `O cliente ainda não assinou ${unsignedConsentCount} termos ativos.`}{" "}
                Registre a assinatura na ficha do cliente.
              </p>
            </div>
          )}

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
        <DialogFooter className="shrink-0">
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
