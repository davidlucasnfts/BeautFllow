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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  onlyText,
  maskQuantity,
  maskMoneyBR,
  quantityDotToBR,
  moneyDotToBR,
} from "@/lib/input-masks";

export interface ProductFormValues {
  name: string;
  unit: string;
  minQuantity: string;
  costPrice: string;
}

const UNITS = ["un", "ml", "l", "g", "kg", "frasco", "sachê", "caixa"];

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = novo produto; preenchido = edição */
  editing: { id: number; values: ProductFormValues } | null;
  isPending: boolean;
  onSubmit: (values: ProductFormValues) => void;
}

export default function ProductFormDialog({
  open,
  onOpenChange,
  editing,
  isPending,
  onSubmit,
}: ProductFormDialogProps) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("un");
  const [minQuantity, setMinQuantity] = useState("0");
  const [costPrice, setCostPrice] = useState("");

  useEffect(() => {
    if (open) {
      setName(editing?.values.name ?? "");
      setUnit(editing?.values.unit || "un");
      setMinQuantity(editing?.values.minQuantity ?? "0");
      setCostPrice(editing?.values.costPrice ?? "");
    }
  }, [open, editing]);

  const valid =
    name.trim().length > 0 &&
    unit.trim().length > 0 &&
    minQuantity.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] flex flex-col w-full max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>
            {editing ? "Editar produto" : "Novo produto"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "O saldo em estoque só muda por movimentações de entrada ou saída."
              : "Cadastre o produto e depois dê entrada no estoque."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto min-h-0 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="product-name">Nome do produto</Label>
            <Input
              id="product-name"
              placeholder="Ex.: Tinta 8.34 louro claro"
              value={name}
              onChange={e =>
                setName(onlyText(e.target.value, { allowDigits: true }))
              }
              maxLength={255}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="product-unit">Unidade</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger id="product-unit" className="w-full">
                  <SelectValue placeholder="Escolha" className="truncate" />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map(u => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="product-min">Estoque mínimo</Label>
              <Input
                id="product-min"
                inputMode="decimal"
                placeholder="0"
                value={minQuantity}
                onChange={e => setMinQuantity(maskQuantity(e.target.value))}
              />
              <p className="text-[11px] text-muted-foreground">
                Nível que dispara o alerta "baixo". A quantidade em estoque é
                adicionada pelos botões Entrada/Saída do produto.
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="product-cost">Preço de custo unitário</Label>
            <Input
              id="product-cost"
              inputMode="numeric"
              placeholder="0,00"
              value={costPrice}
              onChange={e => setCostPrice(maskMoneyBR(e.target.value, 7))}
            />
          </div>
        </div>
        <DialogFooter className="shrink-0 gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!valid || isPending}
            onClick={() =>
              onSubmit({ name: name.trim(), unit, minQuantity, costPrice })
            }
          >
            {isPending ? "Salvando..." : editing ? "Salvar" : "Cadastrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function valuesFromProduct(p: {
  name: string;
  unit: string;
  minQuantity: string | number;
  costPrice: string | number;
}): ProductFormValues {
  return {
    name: p.name,
    unit: p.unit,
    minQuantity: quantityDotToBR(p.minQuantity),
    costPrice: moneyDotToBR(String(p.costPrice)),
  };
}
