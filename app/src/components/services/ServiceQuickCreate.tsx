import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import {
  onlyText,
  onlyDigits,
  maskMoneyBR,
  moneyBRToDot,
} from "@/lib/input-masks";
import { getSegmentLabel } from "@contracts/segment-labels";

interface ServiceQuickCreateProps {
  /** id do serviço criado + preço/duração informados (útil para somar
   *  o valor no checkout antes do refetch da lista) */
  onCreated: (
    serviceId: string,
    price: string,
    durationMinutes: number
  ) => void;
  onCancel: () => void;
}

/** Mini-formulário de serviço dentro do agendamento (sem sair da tela).
 *  Cria só nome + preço + duração. Campos avançados (consentimento,
 *  retorno, instruções de cuidado) continuam na aba Serviços. */
export default function ServiceQuickCreate({
  onCreated,
  onCancel,
}: ServiceQuickCreateProps) {
  const { salon } = useSalon();
  const utils = trpc.useUtils();
  const [form, setForm] = useState({
    name: "",
    price: "",
    durationMinutes: "60",
  });

  const serviceLabel = salon
    ? getSegmentLabel(salon.segment, "service").toLowerCase()
    : "serviço";

  const create = trpc.service.create.useMutation({
    onSuccess: data => {
      utils.service.list.invalidate();
      toast.success(
        `${serviceLabel.charAt(0).toUpperCase() + serviceLabel.slice(1)} cadastrado e selecionado`
      );
      if (data?.id)
        onCreated(String(data.id), moneyBRToDot(form.price), Number(form.durationMinutes));
    },
    onError: e => toast.error(e.message),
  });

  function handleSubmit() {
    if (!salon) return;
    if (!form.name.trim()) {
      toast.error(`Informe o nome do ${serviceLabel}`);
      return;
    }
    const price = moneyBRToDot(form.price);
    if (!price || Number(price) <= 0) {
      toast.error("Informe um preço válido");
      return;
    }
    const duration = Number(form.durationMinutes);
    if (!duration || duration < 1) {
      toast.error("Informe a duração em minutos");
      return;
    }
    create.mutate({
      salonId: salon.id,
      name: form.name.trim(),
      price,
      durationMinutes: duration,
    });
  }

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-3">
      <p className="text-xs font-medium text-primary">
        Cadastrar {serviceLabel} rápido
      </p>
      <div className="grid gap-2">
        <Label>Nome</Label>
        <Input
          value={form.name}
          onChange={e => setForm({ ...form, name: onlyText(e.target.value) })}
          placeholder="Ex.: Corte, Escova..."
          autoFocus
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>Preço (R$)</Label>
          <Input
            value={form.price}
            onChange={e =>
              setForm({ ...form, price: maskMoneyBR(e.target.value) })
            }
            placeholder="0,00"
            inputMode="numeric"
          />
        </div>
        <div className="grid gap-2">
          <Label>Duração (min)</Label>
          <Input
            value={form.durationMinutes}
            onChange={e =>
              setForm({
                ...form,
                durationMinutes: onlyDigits(e.target.value).slice(0, 4),
              })
            }
            placeholder="60"
            inputMode="numeric"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          onClick={handleSubmit}
          disabled={create.isPending}
          className="flex-1"
        >
          {create.isPending ? "Salvando..." : "Cadastrar e selecionar"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onCancel}
          disabled={create.isPending}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}
