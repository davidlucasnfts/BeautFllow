import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CONSENT_TEMPLATES } from "./consent-templates";

type EditingForm = { id: number; title: string; content: string } | null;

interface ConsentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = criar novo termo; preenchido = editar existente */
  editing: EditingForm;
  isPending: boolean;
  onSubmit: (data: { title: string; content: string }) => void;
}

/** Formulário de criação/edição de termo de autorização */
export default function ConsentFormDialog({
  open,
  onOpenChange,
  editing,
  isPending,
  onSubmit,
}: ConsentFormDialogProps) {
  const [form, setForm] = useState({ title: "", content: "" });
  // sincroniza sempre que o dialog abre com outro termo (padrão ServiceFormDialog)
  const [syncedKey, setSyncedKey] = useState("");
  const syncKey = `${open}|${editing?.id ?? "new"}`;
  if (open && syncKey !== syncedKey) {
    setSyncedKey(syncKey);
    setForm({ title: editing?.title ?? "", content: editing?.content ?? "" });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {editing ? "Editar Termo de Autorização" : "Novo Termo de Autorização"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 overflow-y-auto min-h-0">
          {!editing && (
            <div className="grid gap-2">
              <Label>Começar de um modelo</Label>
              <Select
                key={syncKey}
                onValueChange={id => {
                  const tpl = CONSENT_TEMPLATES.find(t => t.id === id);
                  if (tpl) setForm({ title: tpl.title, content: tpl.content });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Termo em branco (escrever do zero)" />
                </SelectTrigger>
                <SelectContent>
                  {CONSENT_TEMPLATES.map(tpl => (
                    <SelectItem key={tpl.id} value={tpl.id}>
                      {tpl.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5">
                Modelo base — revise com um advogado para procedimentos de risco.
              </p>
            </div>
          )}
          <div className="grid gap-2">
            <Label>Título *</Label>
            <Input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Termo de Depilação a Laser"
            />
          </div>
          <div className="grid gap-2">
            <Label>Conteúdo do Termo *</Label>
            <Textarea
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              rows={8}
              placeholder="Descreva os riscos, cuidados e autorizações..."
            />
          </div>
        </div>
        <DialogFooter className="shrink-0">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            onClick={() => onSubmit(form)}
            disabled={isPending || !form.title.trim() || !form.content.trim()}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
