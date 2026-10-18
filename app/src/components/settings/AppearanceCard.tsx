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
import { Palette } from "lucide-react";
import { toast } from "sonner";
import {
  themesForSegment,
  defaultThemeForSegment,
} from "@contracts/segment-palettes";
import {
  segmentLabels,
  type SalonSegment,
} from "@contracts/segment-labels";

const SEGMENTS: SalonSegment[] = [
  "beauty_salon",
  "barbershop",
  "aesthetic_clinic",
];

/** Aparência: tipo de estabelecimento (segmento) + tema do segmento */
export default function AppearanceCard() {
  const { salon, setSalon } = useSalon();
  const utils = trpc.useUtils();

  const [themeId, setThemeId] = useState<string | null>(null);
  const [segment, setSegment] = useState<SalonSegment | null>(null);
  const [syncedId, setSyncedId] = useState<number | null>(null);
  if (salon && syncedId !== salon.id) {
    setSyncedId(salon.id);
    setThemeId(salon.theme ?? defaultThemeForSegment(salon.segment).id);
    setSegment(salon.segment);
  }

  const updateSalonMutation = trpc.salon.update.useMutation({
    onError: e => toast.error(e.message),
  });
  const updateSettingsMutation = trpc.salon.updateSettings.useMutation({
    onError: e => toast.error(e.message),
  });

  if (!salon || !segment) return null;

  const segmentThemes = themesForSegment(segment);
  // trocar de segmento pode invalidar o tema escolhido — volta pro padrão
  const effectiveThemeId = segmentThemes.some(t => t.id === themeId)
    ? (themeId as string)
    : defaultThemeForSegment(segment).id;

  async function handleSave() {
    if (!salon || !segment) return;
    try {
      if (segment !== salon.segment) {
        await updateSalonMutation.mutateAsync({ id: salon.id, segment });
      }
      await updateSettingsMutation.mutateAsync({
        id: salon.id,
        theme: effectiveThemeId,
      });
      setSalon({ ...salon, segment, theme: effectiveThemeId });
      utils.salon.list.invalidate();
      toast.success("Aparência salva");
    } catch {
      // erro já exibido pelo onError das mutations
    }
  }

  const isPending = updateSalonMutation.isPending || updateSettingsMutation.isPending;

  return (
    <Card className="max-w-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Palette className="h-4 w-4 text-slate-500" />
          Aparência do sistema
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label>Tipo de estabelecimento</Label>
          <Select
            value={segment}
            onValueChange={v => setSegment(v as SalonSegment)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {SEGMENTS.map(s => (
                <SelectItem key={s} value={s}>
                  {segmentLabels[s].segmentName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Trocar o segmento muda os temas disponíveis abaixo.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {segmentThemes.map(theme => {
            const selected = effectiveThemeId === theme.id;
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
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
