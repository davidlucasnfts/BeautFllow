import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Scissors, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { getSegmentLabel } from "@contracts/segment-labels";
import { moneyDotToBR } from "@/lib/input-masks";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import ServiceCard, { type ServiceForCard } from "@/components/services/ServiceCard";
import ServiceFormDialog, {
  type ServiceFormValues,
} from "@/components/services/ServiceFormDialog";

function formFromService(s: ServiceForCard): ServiceFormValues {
  return {
    name: s.name,
    description: s.description ?? "",
    category: s.category ?? "",
    durationMinutes: s.durationMinutes,
    price: moneyDotToBR(String(s.price)),
    color: s.color ?? "#6366f1",
    requiresConsent: s.requiresConsent,
    preCareInstructions: s.preCareInstructions ?? "",
    postCareInstructions: s.postCareInstructions ?? "",
  };
}

export default function Services() {
  const { salon } = useSalon();
  const segmentLabel = (key: Parameters<typeof getSegmentLabel>[1]) =>
    salon
      ? getSegmentLabel(salon.segment, key)
      : getSegmentLabel("beauty_salon", key);
  const label = segmentLabel("service");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [initialForm, setInitialForm] = useState<ServiceFormValues | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const utils = trpc.useUtils();
  // traz ativos e inativos de uma vez (catálogo é pequeno) e separa na tela
  const { data: services, isLoading } = trpc.service.list.useQuery(
    { salonId: salon?.id ?? 0, includeInactive: true },
    { enabled: !!salon }
  );

  const invalidate = () => utils.service.list.invalidate();

  const createMutation = trpc.service.create.useMutation({
    onSuccess: () => {
      invalidate();
      setOpen(false);
      toast.success(`${label} criado`);
    },
    onError: e => toast.error(e.message),
  });

  const updateMutation = trpc.service.update.useMutation({
    onSuccess: () => {
      invalidate();
      setOpen(false);
      setEditing(null);
      toast.success(`${label} atualizado`);
    },
    onError: e => toast.error(e.message),
  });

  const deleteMutation = trpc.service.delete.useMutation({
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
      toast.success(`${label} removido`);
    },
    onError: e => toast.error(e.message),
  });

  const reactivateMutation = trpc.service.reactivate.useMutation({
    onSuccess: () => {
      invalidate();
      toast.success(`${label} reativado`);
    },
    onError: e => toast.error(e.message),
  });

  const active = services?.filter(s => s.isActive);
  const inactive = services?.filter(s => !s.isActive);
  const categories = [
    ...new Set((services ?? []).map(s => s.category).filter((c): c is string => !!c)),
  ];

  function matches(s: ServiceForCard) {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.category ?? "").toLowerCase().includes(q)
    );
  }

  function handleNew() {
    setEditing(null);
    setInitialForm(null);
    setOpen(true);
  }

  function handleEdit(s: ServiceForCard) {
    setEditing(s.id);
    setInitialForm(formFromService(s));
    setOpen(true);
  }

  function handleDuplicate(s: ServiceForCard) {
    setEditing(null);
    setInitialForm({ ...formFromService(s), name: `${s.name} (cópia)` });
    setOpen(true);
  }

  function handleSubmit(values: ServiceFormValues) {
    if (!salon) return;
    const { price, ...data } = values;
    if (editing) {
      updateMutation.mutate({ id: editing, salonId: salon.id, ...data, price });
    } else {
      createMutation.mutate({ salonId: salon.id, ...data, price });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{label}s</h1>
          <p className="text-muted-foreground">
            Seus {label.toLowerCase()}s e preços
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" /> Novo {label}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou categoria..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 bg-muted" />
          ))}
        </div>
      ) : active && active.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {active.filter(matches).map(s => (
            <ServiceCard
              key={s.id}
              service={s}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={svc => setDeleteTarget({ id: svc.id, name: svc.name })}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <Scissors className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Nenhum {label.toLowerCase()} cadastrado.</p>
        </div>
      )}

      {inactive && inactive.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Inativos ({inactive.length})
          </h2>
          <div className="rounded-xl border bg-card divide-y overflow-hidden">
            {inactive.filter(matches).map(s => (
              <div
                key={s.id}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50/50 transition-colors"
              >
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: s.color ?? "#6366f1" }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.durationMinutes} min · R$ {moneyDotToBR(String(s.price))}
                  </p>
                </div>
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px]">
                  Inativo
                </Badge>
                <button
                  type="button"
                  onClick={() =>
                    salon &&
                    reactivateMutation.mutate({ id: s.id, salonId: salon.id })
                  }
                  className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition-colors shrink-0"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reativar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <ServiceFormDialog
        open={open}
        onOpenChange={setOpen}
        editingId={editing}
        initial={initialForm}
        categories={categories}
        serviceLabel={label}
        isPending={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
        itemType={label}
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
