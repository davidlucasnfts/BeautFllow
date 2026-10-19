import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { onlyText, maskPhoneBR } from "@/lib/input-masks";

interface ClientQuickCreateProps {
  initialName: string;
  onCreated: (clientId: string) => void;
  onCancel: () => void;
}

/** Mini-formulário de cliente dentro do agendamento (sem sair da tela).
 *  Cria só nome + telefone + consentimento LGPD. A ficha completa
 *  (nascimento, observações etc.) continua na aba Clientes. */
export default function ClientQuickCreate({
  initialName,
  onCreated,
  onCancel,
}: ClientQuickCreateProps) {
  const { salon } = useSalon();
  const utils = trpc.useUtils();
  const [form, setForm] = useState({
    name: onlyText(initialName),
    phone: "",
    consentGiven: false,
  });

  const create = trpc.customer.create.useMutation({
    onSuccess: data => {
      utils.customer.list.invalidate();
      toast.success("Cliente cadastrado e selecionado");
      if (data?.id) onCreated(String(data.id));
    },
    onError: e => toast.error(e.message),
  });

  function handleSubmit() {
    if (!salon) return;
    if (!form.name.trim()) {
      toast.error("Informe o nome do cliente");
      return;
    }
    if (!form.phone.trim()) {
      toast.error("Informe o telefone do cliente");
      return;
    }
    if (!form.consentGiven) {
      toast.error("Marque que o cliente autorizou o uso dos dados (LGPD)");
      return;
    }
    create.mutate({
      salonId: salon.id,
      name: form.name.trim(),
      phone: form.phone,
      consentGiven: true,
    });
  }

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-3">
      <p className="text-xs font-medium text-primary">Cadastrar cliente rápido</p>
      <div className="grid gap-2">
        <Label>Nome</Label>
        <Input
          value={form.name}
          onChange={e => setForm({ ...form, name: onlyText(e.target.value) })}
          placeholder="Maria Silva"
        />
      </div>
      <div className="grid gap-2">
        <Label>Telefone (WhatsApp)</Label>
        <Input
          value={form.phone}
          onChange={e =>
            setForm({ ...form, phone: maskPhoneBR(e.target.value) })
          }
          placeholder="(11) 99999-9999"
          inputMode="numeric"
        />
      </div>
      <div className="flex items-start gap-2">
        <Checkbox
          id="quick-consent"
          checked={form.consentGiven}
          onCheckedChange={v =>
            setForm({ ...form, consentGiven: v === true })
          }
        />
        <Label
          htmlFor="quick-consent"
          className="text-xs font-normal leading-tight"
        >
          Cliente autorizou o uso dos dados (LGPD)
        </Label>
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
