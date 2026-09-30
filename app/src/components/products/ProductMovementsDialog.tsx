import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDownToLine, ArrowUpFromLine, History } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { quantityDotToBR } from "@/lib/input-masks";

interface ProductMovementsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: { id: number; name: string; unit: string } | null;
}

/** Histórico de movimentações do produto (entrada/saída) */
export default function ProductMovementsDialog({
  open,
  onOpenChange,
  product,
}: ProductMovementsDialogProps) {
  const { salon } = useSalon();
  const { data: movements, isLoading } = trpc.product.movements.useQuery(
    { productId: product?.id ?? 0, salonId: salon?.id ?? 0 },
    { enabled: !!salon && !!product && open }
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] flex flex-col w-full max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-slate-600" />
            Movimentações
          </DialogTitle>
          <DialogDescription>
            {product?.name} — histórico de entradas e saídas
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto min-h-0 py-2">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full bg-muted" />
              ))}
            </div>
          ) : !movements || movements.length === 0 ? (
            <p className="text-center py-10 text-sm text-muted-foreground">
              Nenhuma movimentação registrada.
            </p>
          ) : (
            <div className="divide-y rounded-lg border">
              {movements.map(m => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 px-3 py-2.5"
                >
                  {m.type === "in" ? (
                    <ArrowDownToLine className="h-4 w-4 shrink-0 text-green-600" />
                  ) : (
                    <ArrowUpFromLine className="h-4 w-4 shrink-0 text-amber-600" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {m.type === "in" ? "Entrada" : "Saída"} ·{" "}
                      {quantityDotToBR(m.quantity)} {product?.unit}
                    </p>
                    {m.reason && (
                      <p className="text-xs text-muted-foreground break-words">
                        {m.reason}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {m.createdAt}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
