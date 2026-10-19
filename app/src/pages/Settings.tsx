import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users } from "lucide-react";
import { toast } from "sonner";
import {
  type ClientStatusSettings,
  defaultClientStatusSettings,
} from "@contracts/constants";
import { onlyDigits } from "@/lib/input-masks";
import SalonProfileCard from "@/components/settings/SalonProfileCard";
import ScheduleSettingsCard from "@/components/settings/ScheduleSettingsCard";
import AppearanceCard from "@/components/settings/AppearanceCard";
import AccountCard from "@/components/settings/AccountCard";
import OnboardingSettingsCard from "@/components/settings/OnboardingSettingsCard";

export default function Settings() {
  const { salon, setSalon } = useSalon();
  const utils = trpc.useUtils();

  // sincroniza o formulário com o salão carregado (sem effect)
  const [clientStatus, setClientStatus] =
    useState<ClientStatusSettings | null>(null);
  const [syncedId, setSyncedId] = useState<number | null>(null);
  if (salon && syncedId !== salon.id) {
    setSyncedId(salon.id);
    setClientStatus(salon.clientStatus);
  }

  const statusMutation = trpc.salon.updateSettings.useMutation({
    onSuccess: () => {
      utils.salon.list.invalidate();
      if (salon && clientStatus)
        setSalon({ ...salon, clientStatus });
      toast.success("Configurações salvas");
    },
    onError: e => toast.error(e.message),
  });

  function handleSaveStatus() {
    if (!salon || !clientStatus) return;
    statusMutation.mutate({ id: salon.id, clientStatus });
  }

  const currentStatus = clientStatus ?? defaultClientStatusSettings;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Ajuste o funcionamento do seu estabelecimento
        </p>
      </div>

      <SalonProfileCard />

      <ScheduleSettingsCard />

      <OnboardingSettingsCard />

      <AppearanceCard />

      <Card className="max-w-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-500" />
            Status dos clientes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Cliente vira VIP quando atingir</Label>
            <Select
              value={currentStatus.mode}
              onValueChange={v =>
                setClientStatus({
                  ...currentStatus,
                  mode: v as ClientStatusSettings["mode"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spent">Valor gasto no mês</SelectItem>
                <SelectItem value="visits">
                  Quantidade de atendimentos no mês
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>
              {currentStatus.mode === "spent"
                ? "Limite VIP (R$ por mês)"
                : "Limite VIP (atendimentos por mês)"}
            </Label>
            <Input
              value={String(currentStatus.vipThreshold)}
              onChange={e =>
                setClientStatus({
                  ...currentStatus,
                  vipThreshold: Math.max(
                    1,
                    Number(onlyDigits(e.target.value).slice(0, 7)) || 1
                  ),
                })
              }
              inputMode="numeric"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Dias sem atender vira "Sumindo"</Label>
              <Input
                value={String(currentStatus.atRiskDays)}
                onChange={e =>
                  setClientStatus({
                    ...currentStatus,
                    atRiskDays: Math.max(
                      7,
                      Number(onlyDigits(e.target.value).slice(0, 3)) || 7
                    ),
                  })
                }
                inputMode="numeric"
              />
            </div>
            <div className="grid gap-2">
              <Label>Dias sem atender vira "Inativo"</Label>
              <Input
                value={String(currentStatus.inactiveDays)}
                onChange={e =>
                  setClientStatus({
                    ...currentStatus,
                    inactiveDays: Math.max(
                      15,
                      Number(onlyDigits(e.target.value).slice(0, 3)) || 15
                    ),
                  })
                }
                inputMode="numeric"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Os status "Novo", "Ativo", "Sumindo" e "Inativo" são calculados
            automaticamente a partir dos agendamentos. Você também pode ajustar
            o status de cada cliente na tela de {` `}
            <span className="font-medium">Clientes</span>.
          </p>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSaveStatus}
              disabled={statusMutation.isPending || !clientStatus}
            >
              {statusMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AppearanceCard />

      <AccountCard />
    </div>
  );
}
