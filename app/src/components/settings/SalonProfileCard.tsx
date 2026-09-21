import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Store } from "lucide-react";
import { toast } from "sonner";
import { maskPhoneBR, maskSlug, onlyText } from "@/lib/input-masks";

const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

type ProfileForm = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  slug: string;
};

export default function SalonProfileCard() {
  const { salon } = useSalon();
  const utils = trpc.useUtils();

  const [form, setForm] = useState<ProfileForm | null>(null);
  const [syncedId, setSyncedId] = useState<number | null>(null);
  if (salon && syncedId !== salon.id) {
    setSyncedId(salon.id);
    setForm({
      name: salon.name ?? "",
      phone: salon.phone ?? "",
      email: salon.email ?? "",
      address: salon.address ?? "",
      city: salon.city ?? "",
      state: salon.state ?? "",
      slug: salon.slug ?? "",
    });
  }

  const updateMutation = trpc.salon.update.useMutation({
    onSuccess: () => {
      utils.salon.list.invalidate();
      toast.success("Dados salvos");
    },
    onError: e => toast.error(e.message),
  });

  const current = form ?? {
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    slug: "",
  };

  function handleSave() {
    if (!salon || !form) return;
    if (form.name.trim().length < 2) {
      toast.error("Informe o nome do estabelecimento.");
      return;
    }
    if (form.slug.trim().length < 2) {
      toast.error("Informe o endereço do link de agendamento.");
      return;
    }
    updateMutation.mutate({
      id: salon.id,
      name: form.name.trim(),
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      address: form.address.trim() || undefined,
      city: form.city.trim() || undefined,
      state: form.state || undefined,
      slug: form.slug.trim(),
    });
  }

  return (
    <Card className="max-w-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Store className="h-4 w-4 text-slate-500" />
          Dados do estabelecimento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label>Nome</Label>
          <Input
            value={current.name}
            onChange={e =>
              setForm({
                ...current,
                name: onlyText(e.target.value, { allowDigits: true }),
              })
            }
            placeholder="Ex: Studio Cabelo & Cia"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Telefone / WhatsApp</Label>
            <Input
              value={current.phone}
              onChange={e =>
                setForm({ ...current, phone: maskPhoneBR(e.target.value) })
              }
              placeholder="(98) 99999-9999"
              inputMode="tel"
            />
          </div>
          <div className="grid gap-2">
            <Label>E-mail</Label>
            <Input
              value={current.email}
              onChange={e => setForm({ ...current, email: e.target.value })}
              placeholder="contato@seunegocio.com"
              type="email"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Endereço</Label>
          <Input
            value={current.address}
            onChange={e => setForm({ ...current, address: e.target.value })}
            placeholder="Rua, número, bairro"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Cidade</Label>
            <Input
              value={current.city}
              onChange={e =>
                setForm({ ...current, city: onlyText(e.target.value) })
              }
              placeholder="São Luís"
            />
          </div>
          <div className="grid gap-2">
            <Label>UF</Label>
            <Select
              value={current.state}
              onValueChange={v => setForm({ ...current, state: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {BRAZILIAN_STATES.map(uf => (
                  <SelectItem key={uf} value={uf}>
                    {uf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Link de agendamento</Label>
          <Input
            value={current.slug}
            onChange={e => setForm({ ...current, slug: maskSlug(e.target.value) })}
            placeholder="studio-cabelo"
          />
          <p className="text-xs text-muted-foreground">
            Seu link fica assim:{" "}
            <span className="font-medium">
              studioflow.com.br/agendar/{current.slug || "..."}
            </span>
          </p>
          <p className="text-xs text-amber-600">
            Ao trocar o link, o endereço antigo para de funcionar. Avise seus
            clientes se ele já estiver sendo usado.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending || !form}
          >
            {updateMutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
