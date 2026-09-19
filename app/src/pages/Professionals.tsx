import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getSegmentLabel } from "@contracts/segment-labels";
import { Plus, Search, UserCircle, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import ProfessionalCard, {
  type ProfessionalForCard,
} from "@/components/professionals/ProfessionalCard";
import ProfessionalFormDialog, {
  type ProfessionalFormValues,
} from "@/components/professionals/ProfessionalFormDialog";

function formFromProfessional(p: ProfessionalForCard): ProfessionalFormValues {
  return {
    name: p.name,
    email: p.email ?? "",
    phone: p.phone ?? "",
    bio: p.bio ?? "",
    commissionRate: String(p.commissionRate),
    color: p.color ?? "#10b981",
    workingHours: p.workingHours ?? "",
  };
}

export default function Professionals() {
  const { salon } = useSalon();
  const segmentLabel = (key: Parameters<typeof getSegmentLabel>[1]) =>
    salon
      ? getSegmentLabel(salon.segment, key)
      : getSegmentLabel("beauty_salon", key);
  const label = segmentLabel("professional");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [initialForm, setInitialForm] = useState<ProfessionalFormValues | null>(
    null
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const utils = trpc.useUtils();
  // traz ativos e inativos de uma vez (equipe é pequena) e separa na tela
  const { data: professionals, isLoading } = trpc.professional.list.useQuery(
    { salonId: salon?.id ?? 0, includeInactive: true },
    { enabled: !!salon }
  );

  const invalidate = () => utils.professional.list.invalidate();

  const createMutation = trpc.professional.create.useMutation({
    onSuccess: () => {
      invalidate();
      setOpen(false);
      toast.success(`${label} cadastrado`);
    },
    onError: e => toast.error(e.message),
  });

  const updateMutation = trpc.professional.update.useMutation({
    onSuccess: () => {
      invalidate();
      setOpen(false);
      setEditing(null);
      toast.success(`${label} atualizado`);
    },
    onError: e => toast.error(e.message),
  });

  const deleteMutation = trpc.professional.delete.useMutation({
    onSuccess: () => {
      invalidate();
      setSelectedId(null);
      setDeleteTarget(null);
      toast.success(`${label} desativado`);
    },
    onError: e => toast.error(e.message),
  });

  const reactivateMutation = trpc.professional.reactivate.useMutation({
    onSuccess: () => {
      invalidate();
      toast.success(`${label} reativado`);
    },
    onError: e => toast.error(e.message),
  });

  const active = professionals?.filter(p => p.isActive);
  const inactive = professionals?.filter(p => !p.isActive);

  function matches(p: ProfessionalForCard) {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.bio ?? "").toLowerCase().includes(q)
    );
  }

  function handleNew() {
    setEditing(null);
    setInitialForm(null);
    setOpen(true);
  }

  function handleEdit(p: ProfessionalForCard) {
    setEditing(p.id);
    setInitialForm(formFromProfessional(p));
    setOpen(true);
  }

  function handleToggle(id: number) {
    setSelectedId(prev => (prev === id ? null : id));
  }

  function handleSubmit(values: ProfessionalFormValues) {
    if (!salon) return;
    if (editing) {
      updateMutation.mutate({ id: editing, salonId: salon.id, ...values });
    } else {
      createMutation.mutate({ salonId: salon.id, ...values });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{label}s</h1>
          <p className="text-muted-foreground">Equipe, comissões e horários</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" /> Novo {label.toLowerCase()}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou especialidade..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 bg-muted" />
          ))}
        </div>
      ) : active && active.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {active.filter(matches).map(p => (
            <ProfessionalCard
              key={p.id}
              professional={p}
              expanded={selectedId === p.id}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={prof => setDeleteTarget({ id: prof.id, name: prof.name })}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <UserCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Nenhum {label.toLowerCase()} cadastrado.</p>
        </div>
      )}

      {inactive && inactive.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Inativos ({inactive.length})
          </h2>
          <div className="rounded-xl border bg-card divide-y overflow-hidden">
            {inactive.filter(matches).map(p => (
              <div
                key={p.id}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50/50 transition-colors"
              >
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: p.color ?? "#10b981" }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Comissão {p.commissionRate}%
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-slate-100 text-slate-600 text-[10px]"
                >
                  Inativo
                </Badge>
                <button
                  type="button"
                  onClick={() =>
                    salon &&
                    reactivateMutation.mutate({ id: p.id, salonId: salon.id })
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

      <ProfessionalFormDialog
        open={open}
        onOpenChange={setOpen}
        editingId={editing}
        initial={initialForm}
        professionalLabel={label.toLowerCase()}
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
