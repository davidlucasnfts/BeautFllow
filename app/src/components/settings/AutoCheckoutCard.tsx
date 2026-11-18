import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCheck } from "lucide-react";
import {
  type AutoCheckoutSettings,
  defaultAutoCheckoutSettings,
} from "@contracts/constants";

const PAYMENT_OPTIONS = [
  { value: "pix", label: "Pix" },
  { value: "cash", label: "Dinheiro" },
  { value: "credit_card", label: "Cartão de crédito" },
  { value: "debit_card", label: "Cartão de débito" },
] as const;

/** Fechamento automático de atendimentos: Concluir em 1 toque gera o
 *  lançamento financeiro (com comissão calculada) sem abrir o checkout.
 *  Salvo em salons.settings.autoCheckout (sem migration). */
export default function AutoCheckoutCard() {
  const { salon, setSalon } = useSalon();
  const utils = trpc.useUtils();

  const [form, setForm] = useState<AutoCheckoutSettings>(
    salon?.autoCheckout ?? defaultAutoCheckoutSettings
  );
  const [syncedId, setSyncedId] = useState<number | null>(null);
  if (salon && syncedId !== salon.id) {
    setSyncedId(salon.id);
    setForm(salon.autoCheckout);
  }

  const mutation = trpc.salon.updateSettings.useMutation({
    onSuccess: () => {
      utils.salon.list.invalidate();
      if (salon) setSalon({ ...salon, autoCheckout: form });
      toast.success("Configuração salva");
    },
    onError: e => toast.error(e.message),
  });

  function handleToggle(enabled: boolean) {
    if (!salon) return;
    const next = { ...form, enabled };
    setForm(next);
    mutation.mutate({ id: salon.id, autoCheckout: next });
  }

  function handlePaymentMethod(
    defaultPaymentMethod: AutoCheckoutSettings["defaultPaymentMethod"]
  ) {
    if (!salon) return;
    const next = { ...form, defaultPaymentMethod };
    setForm(next);
    mutation.mutate({ id: salon.id, autoCheckout: next });
  }

  if (!salon) return null;

  return (
    <Card className="max-w-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CheckCheck className="h-4 w-4 text-slate-500" />
          Fechamento de atendimentos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor="auto-checkout" className="font-medium">
              Concluir em 1 toque
            </Label>
            <p className="text-xs text-muted-foreground">
              O botão Concluir fecha o atendimento e já gera o lançamento no
              financeiro com o valor da tabela e a comissão do profissional —
              sem abrir a tela de checkout. Para desconto ou forma de pagamento
              diferente, use "Concluir com ajustes" na agenda.
            </p>
          </div>
          <Switch
            id="auto-checkout"
            checked={form.enabled}
            onCheckedChange={handleToggle}
            disabled={mutation.isPending}
            className="mt-0.5"
          />
        </div>

        {form.enabled && (
          <div className="grid gap-1.5 border-t border-slate-100 pt-4">
            <Label className="text-xs text-muted-foreground">
              Forma de pagamento padrão
            </Label>
            <Select
              value={form.defaultPaymentMethod}
              onValueChange={v =>
                handlePaymentMethod(
                  v as AutoCheckoutSettings["defaultPaymentMethod"]
                )
              }
              disabled={mutation.isPending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Usada nos fechamentos automáticos. O lançamento gerado pode ser
              editado depois na tela de Financeiro.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
