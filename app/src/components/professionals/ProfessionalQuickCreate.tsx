import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserCheck } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { onlyText } from "@/lib/input-masks";
import { getSegmentLabel } from "@contracts/segment-labels";

interface ProfessionalQuickCreateProps {
  onCreated: (professionalId: string) => void;
  onCancel: () => void;
}

/** Mini-formulário de profissional dentro do agendamento (sem sair da tela).
 *  Cria só nome + comissão opcional. Dados completos (e-mail, telefone,
 *  horários) continuam na aba Profissionais. */
export default function ProfessionalQuickCreate({
  onCreated,
  onCancel,
}: ProfessionalQuickCreateProps) {
  const { salon } = useSalon();
  const utils = trpc.useUtils();
  const { data: me } = trpc.localAuth.me.useQuery();
  const [form, setForm] = useState({ name: "", commissionRate: "" });

  const professionalLabel = salon
    ? getSegmentLabel(salon.segment, "professional").toLowerCase()
    : "profissional";

  const create = trpc.professional.create.useMutation({
    onSuccess: data => {
      utils.professional.list.invalidate();
      toast.success(
        `${professionalLabel.charAt(0).toUpperCase() + professionalLabel.slice(1)} cadastrado e selecionado`
      );
      if (data?.id) onCreated(String(data.id));
    },
    onError: e => toast.error(e.message),
  });

  function handleSubmit() {
    if (!salon) return;
    if (!form.name.trim()) {
      toast.error(`Informe o nome do ${professionalLabel}`);
      return;
    }
    create.mutate({
      salonId: salon.id,
      name: form.name.trim(),
      commissionRate: form.commissionRate.trim() || "0.00",
    });
  }

  function handleCreateMe() {
    const fallbackName = me?.name || me?.email?.split("@")[0] || "";
    setForm(f => ({ ...f, name: fallbackName }));
  }

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-primary">
          Cadastrar {professionalLabel} rápido
        </p>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-7 text-xs gap-1"
          onClick={handleCreateMe}
        >
          <UserCheck className="h-3 w-3" />
          Sou eu
        </Button>
      </div>
      <div className="grid gap-2">
        <Label>Nome</Label>
        <Input
          value={form.name}
          onChange={e => setForm({ ...form, name: onlyText(e.target.value) })}
          placeholder="Nome"
          autoFocus
        />
      </div>
      <div className="grid gap-2">
        <Label>Comissão % (opcional)</Label>
        <Input
          value={form.commissionRate}
          onChange={e =>
            setForm({
              ...form,
              commissionRate: e.target.value.replace(/[^\d.,]/g, ""),
            })
          }
          placeholder="0,00"
          inputMode="decimal"
        />
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
