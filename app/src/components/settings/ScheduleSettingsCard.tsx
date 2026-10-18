import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock } from "lucide-react";
import { toast } from "sonner";
import {
  type ScheduleSettings,
  defaultScheduleSettings,
} from "@contracts/constants";
import { generateTimeSlots } from "@/lib/time-slots";

const START_OPTIONS = generateTimeSlots("05:00", "12:00", 30);
const END_OPTIONS = generateTimeSlots("12:00", "23:30", 30);
const SLOT_OPTIONS = [
  { value: "30", label: "30 minutos" },
  { value: "60", label: "60 minutos (1 em 1 hora)" },
];

const WORK_DAYS = [
  { day: 0, label: "Dom" },
  { day: 1, label: "Seg" },
  { day: 2, label: "Ter" },
  { day: 3, label: "Qua" },
  { day: 4, label: "Qui" },
  { day: 5, label: "Sex" },
  { day: 6, label: "Sáb" },
];

// faixa comum de almoço; "Sem pausa" = ""
const BREAK_OPTIONS = generateTimeSlots("10:00", "16:30", 30);

const MIN_ADVANCE_OPTIONS = [
  { value: "0", label: "Sem antecedência mínima" },
  { value: "30", label: "30 minutos" },
  { value: "60", label: "1 hora" },
  { value: "120", label: "2 horas" },
  { value: "240", label: "4 horas" },
  { value: "1440", label: "24 horas" },
];

const MAX_ADVANCE_OPTIONS = [
  { value: "7", label: "7 dias" },
  { value: "15", label: "15 dias" },
  { value: "30", label: "30 dias" },
  { value: "60", label: "60 dias" },
  { value: "90", label: "90 dias" },
];

/** Horário de funcionamento + regras do agendamento online */
export default function ScheduleSettingsCard() {
  const { salon, setSalon } = useSalon();
  const utils = trpc.useUtils();

  const [form, setForm] = useState<ScheduleSettings | null>(null);
  const [syncedId, setSyncedId] = useState<number | null>(null);
  if (salon && syncedId !== salon.id) {
    setSyncedId(salon.id);
    setForm(salon.schedule);
  }

  const updateMutation = trpc.salon.updateSettings.useMutation({
    onSuccess: () => {
      utils.salon.list.invalidate();
      if (salon && form) setSalon({ ...salon, schedule: form });
      toast.success("Configurações salvas");
    },
    onError: e => toast.error(e.message),
  });

  const current = form ?? defaultScheduleSettings;

  function toggleWorkDay(day: number, checked: boolean) {
    const workDays = checked
      ? [...current.workDays, day].sort((a, b) => a - b)
      : current.workDays.filter(d => d !== day);
    setForm({ ...current, workDays });
  }

  function handleSave() {
    if (!salon || !form) return;
    if (form.dayEnd <= form.dayStart) {
      toast.error(
        "O horário de fechamento deve ser depois do horário de abertura."
      );
      return;
    }
    if (form.workDays.length === 0) {
      toast.error("Marque pelo menos um dia de funcionamento.");
      return;
    }
    if (!!form.breakStart !== !!form.breakEnd) {
      toast.error("Preencha o início e o fim da pausa, ou deixe os dois vazios.");
      return;
    }
    if (
      form.breakStart &&
      form.breakEnd &&
      form.breakEnd <= form.breakStart
    ) {
      toast.error("O fim da pausa deve ser depois do início.");
      return;
    }
    updateMutation.mutate({ id: salon.id, ...form });
  }

  return (
    <Card className="max-w-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-500" />
          Horário de funcionamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Abre às</Label>
            <Select
              value={current.dayStart}
              onValueChange={v => setForm({ ...current, dayStart: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {START_OPTIONS.map(slot => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Fecha às</Label>
            <Select
              value={current.dayEnd}
              onValueChange={v => setForm({ ...current, dayEnd: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {END_OPTIONS.map(slot => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Intervalo entre horários</Label>
          <Select
            value={String(current.slotMinutes)}
            onValueChange={v =>
              setForm({ ...current, slotMinutes: Number(v) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {SLOT_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Ex: com 30 minutos, os clientes veem 13:00, 13:30, 14:00...
          </p>
        </div>

        <div className="grid gap-2">
          <Label>Dias de funcionamento</Label>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {WORK_DAYS.map(({ day, label }) => (
              <div key={day} className="flex items-center gap-1.5">
                <Checkbox
                  id={`workday-${day}`}
                  checked={current.workDays.includes(day)}
                  onCheckedChange={checked => toggleWorkDay(day, checked === true)}
                />
                <Label
                  htmlFor={`workday-${day}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {label}
                </Label>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Dias desmarcados não aparecem na sua agenda nem no agendamento
            online.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Pausa começa</Label>
            <Select
              value={current.breakStart === "" ? "none" : current.breakStart}
              onValueChange={v =>
                setForm({ ...current, breakStart: v === "none" ? "" : v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sem pausa" className="truncate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem pausa</SelectItem>
                {BREAK_OPTIONS.map(slot => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Pausa termina</Label>
            <Select
              value={current.breakEnd === "" ? "none" : current.breakEnd}
              onValueChange={v =>
                setForm({ ...current, breakEnd: v === "none" ? "" : v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sem pausa" className="truncate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem pausa</SelectItem>
                {BREAK_OPTIONS.map(slot => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-xs text-muted-foreground -mt-2">
          Ex: 12:00 às 13:00 — nenhum horário é oferecido nesse intervalo.
          Deixe "Sem pausa" nos dois se não houver.
        </p>

        <div className="border-t border-slate-100 pt-4 space-y-4">
          <p className="text-sm font-medium">Agendamento online</p>
          <div className="grid gap-2">
            <Label>Antecedência mínima</Label>
            <Select
              value={String(current.minAdvanceMinutes)}
              onValueChange={v =>
                setForm({ ...current, minAdvanceMinutes: Number(v) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {MIN_ADVANCE_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Ex: com 2 horas, o cliente não marca um horário que começa daqui
              a menos de 2 horas.
            </p>
          </div>
          <div className="grid gap-2">
            <Label>Até quantos dias à frente</Label>
            <Select
              value={String(current.maxAdvanceDays)}
              onValueChange={v =>
                setForm({ ...current, maxAdvanceDays: Number(v) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {MAX_ADVANCE_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-start justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="grid gap-0.5">
              <Label
                htmlFor="online-paused"
                className="text-sm font-medium cursor-pointer"
              >
                Pausar agendamento online
              </Label>
              <p className="text-xs text-muted-foreground">
                Férias ou reforma — seu link continua ativo, mas ninguém
                consegue agendar.
              </p>
            </div>
            <Switch
              id="online-paused"
              checked={current.onlineBookingPaused}
              onCheckedChange={v =>
                setForm({ ...current, onlineBookingPaused: v })
              }
              className="mt-0.5"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending || !form}
          >
            {updateMutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground border-t border-slate-100 pt-3">
          Essas regras valem para o seu link de agendamento online. Na agenda
          interna, você agenda como quiser (exceto dias fechados e pausa).
        </p>
      </CardContent>
    </Card>
  );
}
