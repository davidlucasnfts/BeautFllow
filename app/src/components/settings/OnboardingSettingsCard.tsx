import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Route } from "lucide-react";

/** Toggle para mostrar/esconder o checklist de primeiros passos na Agenda.
 *  Fica salvo em salons.settings.showOnboarding (sem migration). */
export default function OnboardingSettingsCard() {
  const { salon, setSalon } = useSalon();
  const utils = trpc.useUtils();

  const [show, setShow] = useState(salon?.showOnboarding !== false);
  const [syncedId, setSyncedId] = useState<number | null>(null);
  if (salon && syncedId !== salon.id) {
    setSyncedId(salon.id);
    setShow(salon.showOnboarding !== false);
  }

  const mutation = trpc.salon.updateSettings.useMutation({
    onSuccess: () => {
      utils.salon.list.invalidate();
      if (salon) setSalon({ ...salon, showOnboarding: show });
      toast.success("Configuração salva");
    },
    onError: e => toast.error(e.message),
  });

  function handleToggle(next: boolean) {
    if (!salon) return;
    setShow(next);
    mutation.mutate({ id: salon.id, showOnboarding: next });
  }

  if (!salon) return null;

  return (
    <Card className="max-w-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Route className="h-4 w-4 text-slate-500" />
          Primeiros passos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor="show-onboarding" className="font-medium">
              Mostrar guia de configuração na Agenda
            </Label>
            <p className="text-xs text-muted-foreground">
              O card "Configure seu StudioFlow" aparece enquanto o salão tiver
              menos de 3 serviços ou 3 profissionais. Desligar aqui o esconde,
              mesmo sem completar.
            </p>
          </div>
          <Switch
            id="show-onboarding"
            checked={show}
            onCheckedChange={handleToggle}
            disabled={mutation.isPending}
          />
        </div>
      </CardContent>
    </Card>
  );
}
