import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Palette } from "lucide-react";
import { toast } from "sonner";
import {
  type ScheduleSettings,
  defaultScheduleSettings,
} from "@contracts/constants";
import {
  themesForSegment,
  defaultThemeForSegment,
} from "@contracts/segment-palettes";
import { generateTimeSlots } from "@/lib/time-slots";

const START_OPTIONS = generateTimeSlots("05:00", "12:00", 30);
const END_OPTIONS = generateTimeSlots("12:00", "23:30", 30);
const SLOT_OPTIONS = [
  { value: "30", label: "30 minutos" },
  { value: "60", label: "60 minutos (1 em 1 hora)" },
];

export default function Settings() {
  const { salon, setSalon } = useSalon();
  const utils = trpc.useUtils();

  // sincroniza o formulário com o salão carregado (sem effect)
  const [form, setForm] = useState<ScheduleSettings | null>(null);
  const [themeId, setThemeId] = useState<string | null>(null);
  const [syncedId, setSyncedId] = useState<number | null>(null);
  if (salon && syncedId !== salon.id) {
    setSyncedId(salon.id);
    setForm(salon.schedule);
    setThemeId(salon.theme ?? defaultThemeForSegment(salon.segment).id);
  }

  const updateMutation = trpc.salon.updateSettings.useMutation({
    onSuccess: () => {
      utils.salon.list.invalidate();
      if (salon && form)
        setSalon({ ...salon, schedule: form, theme: themeId });
      toast.success("Configurações salvas");
    },
    onError: e => toast.error(e.message),
  });

  function handleSave() {
    if (!salon || !form) return;
    if (form.dayEnd <= form.dayStart) {
      toast.error("O horário de fechamento deve ser depois do horário de abertura.");
      return;
    }
    updateMutation.mutate({ id: salon.id, ...form, theme: themeId ?? undefined });
  }

  const current = form ?? defaultScheduleSettings;
  const segmentThemes = salon ? themesForSegment(salon.segment) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Ajuste o funcionamento do seu estabelecimento
        </p>
      </div>

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

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending || !form}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updateMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground border-t border-slate-100 pt-3">
            Esses horários aparecem na sua agenda e no seu link de agendamento
            online.
          </p>
        </CardContent>
      </Card>

      <Card className="max-w-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4 text-slate-500" />
            Aparência do sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {segmentThemes.map(theme => {
              const selected = themeId === theme.id;
              const { palette } = theme;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setThemeId(theme.id)}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors ${
                    selected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex -space-x-1.5">
                    <span
                      className="h-6 w-6 rounded-full border-2 border-white"
                      style={{ backgroundColor: palette.primary }}
                    />
                    <span
                      className="h-6 w-6 rounded-full border-2 border-white"
                      style={{ backgroundColor: palette.accent }}
                    />
                    <span
                      className="h-6 w-6 rounded-full border-2 border-white"
                      style={{ backgroundColor: palette.secondary }}
                    />
                  </span>
                  <span className="text-xs font-medium text-center leading-tight">
                    {theme.name}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground">
            A cor escolhida aparece no seu painel e no seu link de agendamento
            online.
          </p>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending || !form || !themeId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updateMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
