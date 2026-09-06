import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import {
  Plus,
  Scissors,
  Clock,
  DollarSign,
  Edit3,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { getSegmentLabel } from "@contracts/segment-labels";
import {
  onlyText,
  onlyDigits,
  maskMoneyBR,
  moneyBRToDot,
  moneyDotToBR,
} from "@/lib/input-masks";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";

export default function Services() {
  const { salon } = useSalon();
  const segmentLabel = (key: Parameters<typeof getSegmentLabel>[1]) =>
    salon
      ? getSegmentLabel(salon.segment, key)
      : getSegmentLabel("beauty_salon", key);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    durationMinutes: 60,
    price: "",
    color: "#6366f1",
    requiresConsent: false,
    preCareInstructions: "",
    postCareInstructions: "",
  });

  const utils = trpc.useUtils();
  const { data: services, isLoading } = trpc.service.list.useQuery(
    { salonId: salon?.id ?? 0 },
    { enabled: !!salon }
  );

  const createMutation = trpc.service.create.useMutation({
    onSuccess: () => {
      utils.service.list.invalidate();
      setOpen(false);
      resetForm();
      toast.success(`${segmentLabel("service")} criado`);
    },
    onError: e => toast.error(e.message),
  });

  const updateMutation = trpc.service.update.useMutation({
    onSuccess: () => {
      utils.service.list.invalidate();
      setOpen(false);
      setEditing(null);
      resetForm();
      toast.success(`${segmentLabel("service")} atualizado`);
    },
    onError: e => toast.error(e.message),
  });

  const deleteMutation = trpc.service.delete.useMutation({
    onSuccess: () => {
      utils.service.list.invalidate();
      setDeleteTarget(null);
      toast.success(`${segmentLabel("service")} removido`);
    },
    onError: e => toast.error(e.message),
  });

  function resetForm() {
    setForm({
      name: "",
      description: "",
      category: "",
      durationMinutes: 60,
      price: "",
      color: "#6366f1",
      requiresConsent: false,
      preCareInstructions: "",
      postCareInstructions: "",
    });
  }

  function handleEdit(s: NonNullable<typeof services>[number]) {
    setEditing(s.id);
    setForm({
      name: s.name,
      description: s.description ?? "",
      category: s.category ?? "",
      durationMinutes: s.durationMinutes,
      price: moneyDotToBR(String(s.price)),
      color: s.color ?? "#6366f1",
      requiresConsent: s.requiresConsent,
      preCareInstructions: s.preCareInstructions ?? "",
      postCareInstructions: s.postCareInstructions ?? "",
    });
    setOpen(true);
  }

  function handleSubmit() {
    if (!salon) return;
    if (!form.durationMinutes || form.durationMinutes < 1) {
      toast.error("Informe a duração do serviço em minutos (ex: 60).");
      return;
    }
    const payload = { ...form, price: moneyBRToDot(form.price) };
    if (editing) {
      updateMutation.mutate({ id: editing, salonId: salon.id, ...payload });
    } else {
      createMutation.mutate({ salonId: salon.id, ...payload });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {segmentLabel("service")}s
          </h1>
          <p className="text-muted-foreground">
            Seus {segmentLabel("service").toLowerCase()}s e preços
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditing(null);
                resetForm();
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Novo {segmentLabel("service")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing
                  ? `Editar ${segmentLabel("service")}`
                  : `Novo ${segmentLabel("service")}`}
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
                      setForm({
                        ...form,
                        category: onlyText(e.target.value),
                      })
                    }
                    placeholder="Ex: Estética"
                  />
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
                      onChange={e =>
                        setForm({ ...form, color: e.target.value })
                      }
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
                  onChange={e =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requiresConsent"
                  checked={form.requiresConsent}
                  onChange={e =>
                    setForm({ ...form, requiresConsent: e.target.checked })
                  }
                />
                <Label htmlFor="requiresConsent" className="cursor-pointer">
                  Exige termo de autorização
                </Label>
              </div>
              <div className="grid gap-2">
                <Label>Pré-cuidados (enviado automaticamente)</Label>
                <Input
                  value={form.preCareInstructions}
                  onChange={e =>
                    setForm({ ...form, preCareInstructions: e.target.value })
                  }
                  placeholder="Evite maquiagem antes do procedimento..."
                />
              </div>
              <div className="grid gap-2">
                <Label>Pós-cuidados (enviado automaticamente)</Label>
                <Input
                  value={form.postCareInstructions}
                  onChange={e =>
                    setForm({ ...form, postCareInstructions: e.target.value })
                  }
                  placeholder="Não exponha ao sol por 24h..."
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : services && services.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map(s => (
            <Card key={s.id} className="group h-full gap-1.5 py-2.5">
              <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-md flex items-center justify-center"
                      style={{ backgroundColor: (s.color ?? "#6366f1") + "20" }}
                    >
                      <Scissors
                        className="h-5 w-5"
                        style={{ color: s.color ?? undefined }}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-base">{s.name}</CardTitle>
                      {s.category && (
                        <p className="text-xs text-muted-foreground">
                          {s.category}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0 w-[92px]">
                    <button
                      type="button"
                      onClick={() => handleEdit(s)}
                      className="flex items-center justify-center gap-1.5 px-2 py-1 text-[11px] font-semibold rounded-md shadow-sm bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <Edit3 className="w-3 h-3" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ id: s.id, name: s.name })}
                      className="flex items-center justify-center gap-1.5 px-2 py-1 text-[11px] font-semibold rounded-md shadow-sm bg-red-600 text-white hover:bg-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                      Excluir
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{s.durationMinutes} min</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>R$ {s.price}</span>
                  </div>
                </div>
                {s.requiresConsent && (
                  <div className="flex items-center gap-2 text-amber-600 text-xs">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Precisa de autorização assinada</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <Scissors className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Nenhum serviço cadastrado.</p>
        </div>
      )}

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
        itemType={segmentLabel("service")}
        itemName={deleteTarget?.name ?? ""}
        onConfirm={() => {
          if (salon && deleteTarget) {
            deleteMutation.mutate({
              id: deleteTarget.id,
              salonId: salon.id,
            });
          }
        }}
      />
    </div>
  );
}
