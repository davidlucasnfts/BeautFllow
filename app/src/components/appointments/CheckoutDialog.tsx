import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCheck } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { maskMoneyBR, moneyBRToDot, moneyDotToBR } from "@/lib/input-masks";
import type { CalendarAppointment } from "@/components/calendar/types";

export interface CheckoutTarget {
  appointment: CalendarAppointment;
  clientId: number;
  clientName: string;
  serviceName: string;
  professionalId: number | null;
  professionalName: string | null;
  /** Preço do serviço em formato dot ("45.00") */
  defaultAmount: string;
}

const PAYMENT_OPTIONS = [
  { value: "pix", label: "Pix" },
  { value: "cash", label: "Dinheiro" },
  { value: "credit_card", label: "Cartão de crédito" },
  { value: "debit_card", label: "Cartão de débito" },
] as const;

interface CheckoutDialogProps {
  target: CheckoutTarget | null;
  onOpenChange: (open: boolean) => void;
}

/** Finalização do atendimento: registra o pagamento e conclui o compromisso */
export default function CheckoutDialog({
  target,
  onOpenChange,
}: CheckoutDialogProps) {
  return (
    <Dialog open={!!target} onOpenChange={onOpenChange}>
      {target && (
        <CheckoutForm
          key={target.appointment.id}
          target={target}
          onClose={() => onOpenChange(false)}
        />
      )}
    </Dialog>
  );
}

function CheckoutForm({
  target,
  onClose,
}: {
  target: CheckoutTarget;
  onClose: () => void;
}) {
  const { salon } = useSalon();
  const utils = trpc.useUtils();
  const [valor, setValor] = useState(() => moneyDotToBR(target.defaultAmount));
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [generateFinancial, setGenerateFinancial] = useState(true);

  const updateMutation = trpc.appointment.update.useMutation({
    onSuccess: () => {
      utils.appointment.list.invalidate();
      utils.financial.list.invalidate();
      utils.financial.summary.invalidate();
      utils.dashboard.metrics.invalidate();
      toast.success("Atendimento concluído");
      onClose();
    },
    onError: e => toast.error(e.message),
  });

  const financialMutation = trpc.financial.create.useMutation({
    onSuccess: () => {
      if (!salon) return;
      updateMutation.mutate({
        id: target.appointment.id,
        salonId: salon.id,
        status: "completed",
      });
    },
    onError: e => toast.error(e.message),
  });

  function handleConfirm() {
    if (!salon || !valor) return;
    if (generateFinancial) {
      financialMutation.mutate({
        salonId: salon.id,
        appointmentId: target.appointment.id,
        clientId: target.clientId,
        professionalId: target.professionalId ?? undefined,
        type: "service",
        description: `${target.serviceName} — ${target.clientName}`,
        amount: moneyBRToDot(valor),
        paymentMethod: paymentMethod as
          | "pix"
          | "credit_card"
          | "debit_card"
          | "cash",
        recordDate: target.appointment.appointmentDate,
      });
    } else {
      updateMutation.mutate({
        id: target.appointment.id,
        salonId: salon.id,
        status: "completed",
      });
    }
  }

  const isPending = financialMutation.isPending || updateMutation.isPending;

  return (
    <DialogContent className="w-full max-w-lg max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Concluir atendimento — {target.clientName}</DialogTitle>
      </DialogHeader>

      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label htmlFor="checkout-valor">Valor (R$)</Label>
          <Input
            id="checkout-valor"
            inputMode="numeric"
            value={valor}
            onChange={e => setValor(maskMoneyBR(e.target.value, 7))}
            placeholder="0,00"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="checkout-pagamento">Forma de pagamento</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger id="checkout-pagamento">
              <SelectValue className="truncate" />
            </SelectTrigger>
            <SelectContent className="z-[60]">
              {PAYMENT_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="checkout-profissional">Profissional</Label>
          <Input
            id="checkout-profissional"
            value={target.professionalName ?? "Sem profissional"}
            disabled
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <Checkbox
            checked={generateFinancial}
            onCheckedChange={checked => setGenerateFinancial(checked === true)}
          />
          Gerar lançamento no financeiro
        </label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={handleConfirm}
          disabled={isPending || !valor}
          className="gap-1.5 bg-green-600 hover:bg-green-700"
        >
          <CheckCheck className="h-4 w-4" />
          {isPending ? "Concluindo..." : "Concluir atendimento"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
