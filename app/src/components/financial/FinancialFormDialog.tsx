import { useState } from "react";
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
import { format } from "date-fns";
import { toast } from "sonner";
import { maskMoneyBR, moneyBRToDot } from "@/lib/input-masks";
import DatePicker from "@/components/DatePicker";

export type FinancialRecordType =
  | "service"
  | "product"
  | "package"
  | "refund"
  | "other";

export type FinancialPaymentMethod =
  | "pix"
  | "credit_card"
  | "debit_card"
  | "cash"
  | "other";

export type FinancialFormValues = {
  clientId: string;
  professionalId: string;
  type: FinancialRecordType;
  description: string;
  amount: string;
  commissionAmount: string;
  paymentMethod: FinancialPaymentMethod;
  recordDate: string;
  notes: string;
};

export function emptyFinancialForm(): FinancialFormValues {
  return {
    clientId: "",
    professionalId: "",
    type: "service",
    description: "",
    amount: "",
    commissionAmount: "",
    paymentMethod: "pix",
    recordDate: format(new Date(), "yyyy-MM-dd"),
    notes: "",
  };
}

interface FinancialFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = criação; number = edição (só valor, descrição, pagamento e data são editáveis) */
  editingId: number | null;
  /** Pré-preenchimento na edição; null = formulário em branco */
  initial: FinancialFormValues | null;
  clients: { id: number; name: string }[] | undefined;
  professionals: { id: number; name: string }[] | undefined;
  isPending: boolean;
  onSubmit: (values: FinancialFormValues) => void;
}

export default function FinancialFormDialog({
  open,
  onOpenChange,
  editingId,
  initial,
  clients,
  professionals,
  isPending,
  onSubmit,
}: FinancialFormDialogProps) {
  // sincroniza o formulário sempre que o dialog abre com outro contexto
  const [form, setForm] = useState<FinancialFormValues>(emptyFinancialForm);
  const [syncedKey, setSyncedKey] = useState("");
  const syncKey = `${open}|${editingId ?? "new"}|${initial?.description ?? ""}`;
  if (open && syncKey !== syncedKey) {
    setSyncedKey(syncKey);
    setForm(initial ?? emptyFinancialForm());
  }

  function handleSubmit() {
    if (!form.recordDate) {
      toast.error("Escolha uma data para o registro.");
      return;
    }
    if (!form.description.trim()) {
      toast.error("Informe a descrição do registro.");
      return;
    }
    if (!form.amount) {
      toast.error("Informe o valor do registro.");
      return;
    }
    if (!editingId && !form.clientId) {
      toast.error("Selecione o cliente do registro.");
      return;
    }
    onSubmit({ ...form, amount: moneyBRToDot(form.amount) });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingId ? "Editar registro" : "Novo registro"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {editingId && (
            <p className="text-xs text-muted-foreground">
              Na edição, apenas valor, descrição, forma de pagamento e data
              podem ser alterados.
            </p>
          )}
          <div className="grid gap-2">
            <Label>Cliente</Label>
            <Select
              value={form.clientId}
              onValueChange={v => setForm({ ...form, clientId: v })}
              disabled={!!editingId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" className="truncate" />
              </SelectTrigger>
              <SelectContent className="z-[60]">
                {clients?.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Tipo</Label>
              <Select
                value={form.type}
                onValueChange={(v: FinancialRecordType) =>
                  setForm({ ...form, type: v })
                }
                disabled={!!editingId}
              >
                <SelectTrigger>
                  <SelectValue className="truncate" />
                </SelectTrigger>
                <SelectContent className="z-[60]">
                  <SelectItem value="service">Serviço</SelectItem>
                  <SelectItem value="product">Produto</SelectItem>
                  <SelectItem value="package">Pacote</SelectItem>
                  <SelectItem value="refund">Reembolso</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Data</Label>
              <DatePicker
                value={form.recordDate}
                onChange={iso => setForm({ ...form, recordDate: iso })}
                placeholder="Selecione"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Descrição</Label>
            <Input
              value={form.description}
              onChange={e =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Valor (R$)</Label>
              <Input
                value={form.amount}
                onChange={e =>
                  setForm({
                    ...form,
                    amount: maskMoneyBR(e.target.value),
                  })
                }
                placeholder="0,00"
                inputMode="numeric"
              />
            </div>
            <div className="grid gap-2">
              <Label>Comissão (R$)</Label>
              <Input
                value={form.commissionAmount}
                onChange={e =>
                  setForm({
                    ...form,
                    commissionAmount: maskMoneyBR(e.target.value),
                  })
                }
                placeholder="0,00"
                inputMode="numeric"
                disabled={!!editingId}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Profissional</Label>
              <Select
                value={form.professionalId}
                onValueChange={v =>
                  setForm({ ...form, professionalId: v })
                }
                disabled={!!editingId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder="Opcional"
                    className="truncate"
                  />
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
              <Label>Pagamento</Label>
              <Select
                value={form.paymentMethod}
                onValueChange={(v: FinancialPaymentMethod) =>
                  setForm({ ...form, paymentMethod: v })
                }
              >
                <SelectTrigger>
                  <SelectValue className="truncate" />
                </SelectTrigger>
                <SelectContent className="z-[60]">
                  <SelectItem value="pix">Pix</SelectItem>
                  <SelectItem value="credit_card">Cartão Crédito</SelectItem>
                  <SelectItem value="debit_card">Cartão Débito</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isPending}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
