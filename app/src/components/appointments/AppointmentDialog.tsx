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
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DatePicker from "@/components/DatePicker";
import { ClientCombobox } from "@/components/clients/ClientCombobox";
import { ServiceMultiSelect } from "./ServiceMultiSelect";
import { Plus, ShieldAlert } from "lucide-react";
import { useState } from "react";
import ClientQuickCreate from "@/components/clients/ClientQuickCreate";
import ProfessionalQuickCreate from "@/components/professionals/ProfessionalQuickCreate";
import ServiceQuickCreate from "@/components/services/ServiceQuickCreate";
import OnboardingChecklist from "@/components/appointments/OnboardingChecklist";
import type { AppointmentFormData } from "./useAppointmentForm";
import type { Client, Professional, Service } from "@db/schema";

/** Valor especial nos Selects: abre o mini-formulário de cadastro rápido */
const CREATE_NEW = "__create__";

/** Só um mini-formulário aberto por vez — abrir um fecha o anterior */
type QuickCreateTarget =
  | "client"
  | "professional"
  | "service-main"
  | "service-extra";

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
  const [quickCreate, setQuickCreate] = useState<QuickCreateTarget | null>(
    null
  );
  const [quickClientName, setQuickClientName] = useState("");

  const hasNoClients = (clients?.length ?? 0) === 0;
  const hasNoServices = (services?.length ?? 0) === 0;
  const hasNoProfessionals = (professionals?.length ?? 0) === 0;
  const showSetup = hasNoClients || hasNoServices || hasNoProfessionals;

  return (
    <Dialog
      open={open}
      onOpenChange={v => {
        if (!v) {
          // fecha qualquer mini-formulário aberto junto com o dialog
          setQuickCreate(null);
          setQuickClientName("");
        }
        onOpenChange(v);
      }}
    >
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
                setQuickCreate("client");
              }}
            />
          )}

          {/* Selects ficam sempre montados — trocar select por mini-form no
              mesmo lugar deixava o dropdown órfão aberto no mobile. O
              mini-form aparece em largura total logo abaixo do campo. */}
          <div className="grid gap-2">
            <Label>Cliente</Label>
            <ClientCombobox
              clients={clients}
              value={form.clientId}
              onChange={v => onFieldChange("clientId", v)}
              onCreate={name => {
                setQuickClientName(name);
                setQuickCreate("client");
              }}
            />
            {quickCreate === "client" && (
              <ClientQuickCreate
                initialName={quickClientName}
                onCreated={id => {
                  onFieldChange("clientId", id);
                  setQuickCreate(null);
                  setQuickClientName("");
                }}
                onCancel={() => {
                  setQuickCreate(null);
                  setQuickClientName("");
                }}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Profissional</Label>
              <Select
                value={form.professionalId}
                onValueChange={v => {
                  if (v === CREATE_NEW) {
                    setQuickCreate("professional");
                    return;
                  }
                  onFieldChange("professionalId", v);
                }}
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
                  {(professionals?.length ?? 0) > 0 && <SelectSeparator />}
                  <SelectItem
                    value={CREATE_NEW}
                    className="text-primary focus:text-primary"
                  >
                    <span className="flex items-center gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                      Cadastrar novo
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Serviço</Label>
              <Select
                value={form.serviceId}
                onValueChange={v => {
                  if (v === CREATE_NEW) {
                    setQuickCreate("service-main");
                    return;
                  }
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
                  {(services?.length ?? 0) > 0 && <SelectSeparator />}
                  <SelectItem
                    value={CREATE_NEW}
                    className="text-primary focus:text-primary"
                  >
                    <span className="flex items-center gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                      Cadastrar novo
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {quickCreate === "professional" && (
            <ProfessionalQuickCreate
              onCreated={id => {
                onFieldChange("professionalId", id);
                setQuickCreate(null);
              }}
              onCancel={() => setQuickCreate(null)}
            />
          )}
          {quickCreate === "service-main" && (
            <ServiceQuickCreate
              onCreated={id => {
                onFieldChange("serviceId", id);
                // o serviço principal não pode aparecer como adicional
                onFieldChange(
                  "extraServiceIds",
                  form.extraServiceIds.filter(x => x !== id)
                );
                setQuickCreate(null);
              }}
              onCancel={() => setQuickCreate(null)}
            />
          )}

          <div className="grid gap-2">
            <Label>Serviços adicionais (opcional)</Label>
            <ServiceMultiSelect
              services={services}
              selectedIds={form.extraServiceIds}
              onChange={ids => onFieldChange("extraServiceIds", ids)}
              excludeIds={form.serviceId ? [form.serviceId] : []}
              onCreate={() => setQuickCreate("service-extra")}
            />
            {quickCreate === "service-extra" && (
              <ServiceQuickCreate
                onCreated={id => {
                  // já entra marcado como adicional do atendimento
                  onFieldChange("extraServiceIds", [
                    ...form.extraServiceIds,
                    id,
                  ]);
                  setQuickCreate(null);
                }}
                onCancel={() => setQuickCreate(null)}
              />
            )}
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
