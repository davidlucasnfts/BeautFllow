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
import { onlyText, onlyDigits, maskPhoneBR } from "@/lib/input-masks";
import { toast } from "sonner";

export type ProfessionalFormValues = {
  name: string;
  email: string;
  phone: string;
  bio: string;
  commissionRate: string;
  color: string;
  workingHours: string;
};

function emptyProfessionalForm(): ProfessionalFormValues {
  return {
    name: "",
    email: "",
    phone: "",
    bio: "",
    commissionRate: "0",
    color: "#10b981",
    workingHours: "",
  };
}

interface ProfessionalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = criação; number = edição */
  editingId: number | null;
  /** Pré-preenchimento na edição; null = formulário em branco */
  initial: ProfessionalFormValues | null;
  professionalLabel: string;
  isPending: boolean;
  onSubmit: (values: ProfessionalFormValues) => void;
}

export default function ProfessionalFormDialog({
  open,
  onOpenChange,
  editingId,
  initial,
  professionalLabel,
  isPending,
  onSubmit,
}: ProfessionalFormDialogProps) {
  // sincroniza o formulário sempre que o dialog abre com outro contexto
  const [form, setForm] =
    useState<ProfessionalFormValues>(emptyProfessionalForm);
  const [syncedKey, setSyncedKey] = useState("");
  const syncKey = `${open}|${editingId ?? "new"}|${initial?.name ?? ""}`;
  if (open && syncKey !== syncedKey) {
    setSyncedKey(syncKey);
    setForm(initial ?? emptyProfessionalForm());
  }

  function handleSubmit() {
    if (!form.name.trim()) {
      toast.error(`Informe o nome do ${professionalLabel}.`);
      return;
    }
    onSubmit(form);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingId
              ? `Editar ${professionalLabel}`
              : `Novo ${professionalLabel}`}
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
              <Label>E-mail</Label>
              <Input
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Telefone</Label>
              <Input
                value={form.phone}
                onChange={e =>
                  setForm({ ...form, phone: maskPhoneBR(e.target.value) })
                }
                placeholder="(11) 99999-9999"
                inputMode="numeric"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Comissão (%)</Label>
              <Input
                value={form.commissionRate}
                onChange={e =>
                  setForm({
                    ...form,
                    commissionRate: onlyDigits(e.target.value).slice(0, 3),
                  })
                }
                inputMode="numeric"
                placeholder="0"
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
            <Label>Especialidades</Label>
            <Input
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              placeholder="Ex: coloração, barba, corte feminino"
            />
          </div>
          <div className="grid gap-2">
            <Label>Horários de trabalho</Label>
            <Input
              value={form.workingHours}
              onChange={e =>
                setForm({ ...form, workingHours: e.target.value })
              }
              placeholder="Ex: Seg–Sex 9h às 19h, Sáb 8h às 14h"
            />
            <p className="text-xs text-muted-foreground">
              Dias e horários em que atende — usado como referência na agenda.
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
