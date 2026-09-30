import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { maskQuantity, quantityToDot, quantityDotToBR } from "@/lib/input-masks";

export interface MovementTarget {
  id: number;
  name: string;
  unit: string;
  quantity: string | number;
}

interface StockMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** produto + tipo da movimentação (definido pelo botão clicado) */
  target: { product: MovementTarget; type: "in" | "out" } | null;
  isPending: boolean;
  onSubmit: (productId: number, quantity: string, reason: string) => void;
}

export default function StockMovementDialog({
  open,
  onOpenChange,
  target,
  isPending,
  onSubmit,
}: StockMovementDialogProps) {
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      setQuantity("");
      setReason("");
    }
  }, [open]);

  const isIn = target?.type === "in";
  const qty = Number(quantityToDot(quantity));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] flex flex-col w-full max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            {isIn ? (
              <ArrowDownToLine className="h-5 w-5 text-green-600" />
            ) : (
              <ArrowUpFromLine className="h-5 w-5 text-amber-600" />
            )}
            {isIn ? "Entrada de estoque" : "Saída de estoque"}
          </DialogTitle>
          <DialogDescription>
            {target?.product.name} — saldo atual:{" "}
            <strong>
              {target ? quantityDotToBR(target.product.quantity) : "-"}{" "}
              {target?.product.unit}
            </strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto min-h-0 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="movement-qty">
              Quantidade ({target?.product.unit})
            </Label>
            <Input
              id="movement-qty"
              inputMode="decimal"
              placeholder="0"
              value={quantity}
              onChange={e => setQuantity(maskQuantity(e.target.value))}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="movement-reason">
              Motivo <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="movement-reason"
              placeholder={
                isIn ? "Ex.: compra do fornecedor, reposição..." : "Ex.: uso no atendimento, consumo interno..."
              }
              value={reason}
              onChange={e => setReason(e.target.value)}
              maxLength={500}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter className="shrink-0 gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className={
              isIn
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            }
            disabled={!quantity || !Number.isFinite(qty) || qty <= 0 || isPending}
            onClick={() =>
              target && onSubmit(target.product.id, quantityToDot(quantity), reason.trim())
            }
          >
            {isPending
              ? "Registrando..."
              : isIn
                ? "Confirmar entrada"
                : "Confirmar saída"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
