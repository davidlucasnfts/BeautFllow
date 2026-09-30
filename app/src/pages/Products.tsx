import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Package, AlertTriangle, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { moneyBRToDot, quantityToDot, quantityDotToBR } from "@/lib/input-masks";
import ProductsList, {
  ProductsEmpty,
  type ProductForList,
} from "@/components/products/ProductsList";
import ProductFormDialog, {
  valuesFromProduct,
  type ProductFormValues,
} from "@/components/products/ProductFormDialog";
import StockMovementDialog from "@/components/products/StockMovementDialog";
import ProductMovementsDialog from "@/components/products/ProductMovementsDialog";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function Products() {
  const { salon } = useSalon();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<{
    id: number;
    values: ProductFormValues;
  } | null>(null);
  const [movement, setMovement] = useState<{
    product: ProductForList;
    type: "in" | "out";
  } | null>(null);
  const [historyTarget, setHistoryTarget] = useState<{
    id: number;
    name: string;
    unit: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductForList | null>(null);

  const utils = trpc.useUtils();
  // ativos e inativos de uma vez (lista é pequena) e separa na tela
  const {
    data: products,
    isLoading,
    isError,
  } = trpc.product.list.useQuery(
    { salonId: salon?.id ?? 0, includeInactive: true },
    { enabled: !!salon }
  );
  const { data: summary } = trpc.product.summary.useQuery(
    { salonId: salon?.id ?? 0 },
    { enabled: !!salon }
  );

  const invalidate = () => {
    utils.product.list.invalidate();
    utils.product.summary.invalidate();
  };

  const createMutation = trpc.product.create.useMutation({
    onSuccess: () => {
      invalidate();
      setFormOpen(false);
      toast.success("Produto cadastrado");
    },
    onError: e => toast.error(e.message),
  });

  const updateMutation = trpc.product.update.useMutation({
    onSuccess: () => {
      invalidate();
      setFormOpen(false);
      setEditing(null);
      toast.success("Produto atualizado");
    },
    onError: e => toast.error(e.message),
  });

  const deleteMutation = trpc.product.delete.useMutation({
    onSuccess: result => {
      invalidate();
      setDeleteTarget(null);
      toast.success(
        result.softDeleted
          ? "Produto inativado (tinha movimentações)"
          : "Produto excluído"
      );
    },
    onError: e => toast.error(e.message),
  });

  const reactivateMutation = trpc.product.reactivate.useMutation({
    onSuccess: () => {
      invalidate();
      toast.success("Produto reativado");
    },
    onError: e => toast.error(e.message),
  });

  const movementMutation = trpc.product.movement.useMutation({
    onSuccess: () => {
      invalidate();
      setMovement(null);
      toast.success("Movimentação registrada");
    },
    onError: e => toast.error(e.message),
  });

  const active = (products ?? []).filter(p => p.isActive);
  const inactive = (products ?? []).filter(p => !p.isActive);
  const term = search.trim().toLowerCase();
  const matches = (p: ProductForList) =>
    !term || p.name.toLowerCase().includes(term);
  const visibleActive = active.filter(matches);

  function handleSubmit(values: ProductFormValues) {
    if (!salon) return;
    const payload = {
      name: values.name,
      unit: values.unit,
      minQuantity: quantityToDot(values.minQuantity || "0"),
      costPrice: moneyBRToDot(values.costPrice || "0"),
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, salonId: salon.id, ...payload });
    } else {
      createMutation.mutate({ salonId: salon.id, ...payload });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">
            Estoque de produtos de uso interno
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Novo produto
        </Button>
      </div>

      {/* Resumo do estoque */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="gap-1.5 py-2.5">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" />
              Total investido
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-xl font-bold">{formatBRL(summary?.totalInvested ?? 0)}</p>
          </CardContent>
        </Card>
        <Card className="gap-1.5 py-2.5">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Produtos ativos
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p className="text-xl font-bold">{summary?.activeCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="gap-1.5 py-2.5">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <AlertTriangle
                className={`h-3.5 w-3.5 ${
                  (summary?.lowStockCount ?? 0) > 0
                    ? "text-amber-600"
                    : "text-muted-foreground"
                }`}
              />
              Estoque baixo
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <p
              className={`text-xl font-bold ${
                (summary?.lowStockCount ?? 0) > 0 ? "text-amber-600" : ""
              }`}
            >
              {summary?.lowStockCount ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar produto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full bg-muted" />
      ) : isError ? (
        <div className="text-center py-20 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Falha ao carregar. Atualize a página.</p>
        </div>
      ) : visibleActive.length > 0 ? (
        <ProductsList
          products={visibleActive}
          onEdit={p => {
            setEditing({ id: p.id, values: valuesFromProduct(p) });
            setFormOpen(true);
          }}
          onMove={(p, type) => setMovement({ product: p, type })}
          onHistory={p =>
            setHistoryTarget({ id: p.id, name: p.name, unit: p.unit })
          }
          onDelete={setDeleteTarget}
        />
      ) : (
        <ProductsEmpty hasSearch={active.length > 0} />
      )}

      {inactive.length > 0 && (
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
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium break-words">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {quantityDotToBR(p.quantity)} {p.unit} em estoque
                  </p>
                </div>
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

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        isPending={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
      />

      <StockMovementDialog
        open={!!movement}
        onOpenChange={open => !open && setMovement(null)}
        target={movement}
        isPending={movementMutation.isPending}
        onSubmit={(productId, quantity, reason) => {
          if (salon && movement) {
            movementMutation.mutate({
              salonId: salon.id,
              productId,
              type: movement.type,
              quantity,
              reason: reason || undefined,
            });
          }
        }}
      />

      <ProductMovementsDialog
        open={!!historyTarget}
        onOpenChange={open => !open && setHistoryTarget(null)}
        product={historyTarget}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.name}</strong> será excluído. Se ele tiver
              movimentações, será inativado em vez de apagado — o histórico de
              entradas e saídas fica preservado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (salon && deleteTarget) {
                  deleteMutation.mutate({
                    id: deleteTarget.id,
                    salonId: salon.id,
                  });
                }
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
