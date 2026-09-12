import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { onlyText, onlyDigits, maskMoneyBR, moneyBRToDot } from "@/lib/input-masks";
import { toast } from "sonner";

export type ServiceFormValues = {
  name: string;
  description: string;
  category: string;
  durationMinutes: number;
  price: string;
  color: string;
  requiresConsent: boolean;
  preCareInstructions: string;
  postCareInstructions: string;
};

function emptyServiceForm(): ServiceFormValues {
  return {
    name: "",
    description: "",
    category: "",
    durationMinutes: 60,
    price: "",
    color: "#6366f1",
    requiresConsent: false,
    preCareInstructions: "",
    postCareInstructions: "",
  };
}

interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = criação (ou duplicata); number = edição */
  editingId: number | null;
  /** Pré-preenchimento (edição ou duplicata); null = formulário em branco */
  initial: ServiceFormValues | null;
  /** Categorias já usadas no salão (sugestão enquanto digita) */
  categories: string[];
  serviceLabel: string;
  isPending: boolean;
  onSubmit: (values: ServiceFormValues) => void;
}

export default function ServiceFormDialog({
  open,
  onOpenChange,
  editingId,
  initial,
  categories,
  serviceLabel,
  isPending,
  onSubmit,
}: ServiceFormDialogProps) {
  // sincroniza o formulário sempre que o dialog abre com outro contexto
  const [form, setForm] = useState<ServiceFormValues>(emptyServiceForm);
  const [syncedKey, setSyncedKey] = useState("");
  const syncKey = `${open}|${editingId ?? "new"}|${initial?.name ?? ""}`;
  if (open && syncKey !== syncedKey) {
    setSyncedKey(syncKey);
    setForm(initial ?? emptyServiceForm());
  }

  function handleSubmit() {
    if (!form.name.trim()) {
      toast.error("Informe o nome do serviço.");
      return;
    }
    if (!form.durationMinutes || form.durationMinutes < 1) {
      toast.error("Informe a duração do serviço em minutos (ex: 60).");
      return;
    }
    if (!form.price) {
      toast.error("Informe o preço do serviço.");
      return;
    }
    onSubmit({ ...form, price: moneyBRToDot(form.price) });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingId
              ? `Editar ${serviceLabel}`
              : `Novo ${serviceLabel}`}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Nome *</Label>
            <Input
              value={form.name}
              onChange={e =>
                setForm({ ...form, name: onlyText(e.target.value) })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Categoria</Label>
              <Input
                value={form.category}
                onChange={e =>
                  setForm({ ...form, category: onlyText(e.target.value) })
                }
                placeholder="Ex: Estética"
                list="service-categories"
              />
              <datalist id="service-categories">
                {categories.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            <div className="grid gap-2">
              <Label>Duração (min) *</Label>
              <Input
                value={form.durationMinutes || ""}
                onChange={e =>
                  setForm({
                    ...form,
                    durationMinutes: Number(
                      onlyDigits(e.target.value).slice(0, 3)
                    ),
                  })
                }
                placeholder="Ex: 60"
                inputMode="numeric"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Preço (R$) *</Label>
              <Input
                value={form.price}
                onChange={e =>
                  setForm({ ...form, price: maskMoneyBR(e.target.value, 7) })
                }
                placeholder="0,00"
                inputMode="numeric"
              />
            </div>
            <div className="grid gap-2">
              <Label>Cor do calendário</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={form.color}
                  onChange={e => setForm({ ...form, color: e.target.value })}
                  className="w-12 h-10 p-1"
                />
                <span className="text-sm text-muted-foreground">
                  {form.color}
                </span>
              </div>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Descrição</Label>
            <Input
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="requiresConsent"
              checked={form.requiresConsent}
              onCheckedChange={v =>
                setForm({ ...form, requiresConsent: v === true })
              }
            />
            <Label htmlFor="requiresConsent" className="cursor-pointer">
              Exige termo de autorização
            </Label>
          </div>
          <div className="grid gap-2">
            <Label>Pré-cuidados</Label>
            <Input
              value={form.preCareInstructions}
              onChange={e =>
                setForm({ ...form, preCareInstructions: e.target.value })
              }
              placeholder="Evite maquiagem antes do procedimento..."
            />
            <p className="text-xs text-muted-foreground">
              Orientações registradas para passar ao cliente antes do
              procedimento.
            </p>
          </div>
          <div className="grid gap-2">
            <Label>Pós-cuidados</Label>
            <Input
              value={form.postCareInstructions}
              onChange={e =>
                setForm({ ...form, postCareInstructions: e.target.value })
              }
              placeholder="Não exponha ao sol por 24h..."
            />
            <p className="text-xs text-muted-foreground">
              Orientações registradas para passar ao cliente depois do
              procedimento.
            </p>
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
