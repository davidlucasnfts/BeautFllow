import { Fragment, useState } from "react";
import {
  Edit3,
  Trash2,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  Package,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { quantityDotToBR } from "@/lib/input-masks";

export interface ProductForList {
  id: number;
  name: string;
  unit: string;
  quantity: string | number;
  minQuantity: string | number;
  costPrice: string | number;
  isActive: boolean;
}

interface ProductsListProps {
  products: ProductForList[];
  onEdit: (product: ProductForList) => void;
  onMove: (product: ProductForList, type: "in" | "out") => void;
  onHistory: (product: ProductForList) => void;
  onDelete: (product: ProductForList) => void;
}

function formatBRL(value: string | number) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function isLow(p: ProductForList) {
  return Number(p.quantity) <= Number(p.minQuantity);
}

/** Tabela no desktop, lista estilo Fila do Dia no mobile (padrão Financeiro) */
export default function ProductsList({
  products,
  onEdit,
  onMove,
  onHistory,
  onDelete,
}: ProductsListProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const primaryActions = (p: ProductForList) => (
    <div className="flex flex-col gap-1" onClick={e => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => onEdit(p)}
        className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
      >
        <Edit3 className="h-3 w-3" />
        Editar
      </button>
      <button
        type="button"
        onClick={() => onMove(p, "in")}
        className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
      >
        <ArrowDownToLine className="h-3 w-3" />
        Entrada
      </button>
      <button
        type="button"
        onClick={() => onMove(p, "out")}
        className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
      >
        <ArrowUpFromLine className="h-3 w-3" />
        Saída
      </button>
    </div>
  );

  const secondaryActions = (p: ProductForList) => (
    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => onHistory(p)}
        className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
      >
        <History className="h-3 w-3" />
        Histórico
      </button>
      <button
        type="button"
        onClick={() => onDelete(p)}
        className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
      >
        <Trash2 className="h-3 w-3" />
        Excluir
      </button>
    </div>
  );

  const statusBadges = (p: ProductForList) => (
    <div className="flex flex-wrap items-center gap-1">
      {isLow(p) && (
        <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 text-[10px]">
          Baixo
        </Badge>
      )}
      <Badge
        variant="secondary"
        className={`text-[10px] ${
          p.isActive
            ? "bg-green-50 text-green-700"
            : "bg-slate-100 text-slate-600"
        }`}
      >
        {p.isActive ? "Ativo" : "Inativo"}
      </Badge>
    </div>
  );

  const detail = (p: ProductForList) => (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg bg-muted/40 p-3 text-xs">
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase">
          Quantidade atual
        </p>
        <p
          className={`text-sm font-semibold ${
            isLow(p) ? "text-amber-600" : ""
          }`}
        >
          {quantityDotToBR(p.quantity)} {p.unit}
        </p>
      </div>
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase">
          Estoque mínimo
        </p>
        <p className="text-sm font-medium">
          {quantityDotToBR(p.minQuantity)} {p.unit}
        </p>
      </div>
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase">
          Custo unitário
        </p>
        <p className="text-sm font-medium">{formatBRL(p.costPrice)}</p>
      </div>
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase">
          Valor investido
        </p>
        <p className="text-sm font-medium">
          {formatBRL(Number(p.quantity) * Number(p.costPrice))}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile: lista (padrão Fila do Dia) */}
      <div className="md:hidden divide-y rounded-lg border">
        {products.map(p => {
          const expanded = expandedId === p.id;
          return (
            <Fragment key={p.id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setExpandedId(expanded ? null : p.id)}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setExpandedId(expanded ? null : p.id);
                  }
                }}
                className={`flex w-full cursor-pointer items-center gap-3 p-3 text-left transition-colors ${
                  expanded ? "bg-primary/5" : "hover:bg-blue-50/50"
                }`}
              >
                {primaryActions(p)}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium break-words">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {quantityDotToBR(p.quantity)} {p.unit} ·{" "}
                    {formatBRL(p.costPrice)}/un
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  {statusBadges(p)}
                </div>
              </div>
              {expanded && (
                <div className="px-3 pb-3 space-y-2">
                  {detail(p)}
                  <div className="flex items-center justify-between gap-2">
                    {secondaryActions(p)}
                    <button
                      type="button"
                      onClick={() => setExpandedId(null)}
                      className="flex items-center gap-1 rounded-md bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}
            </Fragment>
          );
        })}
      </div>

      {/* Desktop: tabela */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-36">Ações</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead>Mínimo</TableHead>
              <TableHead>Custo unit.</TableHead>
              <TableHead className="text-right">Investido</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map(p => (
              <TableRow key={p.id} className="hover:bg-blue-50/50">
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(p)}
                        className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      >
                        <Edit3 className="h-3 w-3" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onMove(p, "in")}
                        className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                      >
                        <ArrowDownToLine className="h-3 w-3" />
                        Entrada
                      </button>
                      <button
                        type="button"
                        onClick={() => onMove(p, "out")}
                        className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                      >
                        <ArrowUpFromLine className="h-3 w-3" />
                        Saída
                      </button>
                      <button
                        type="button"
                        onClick={() => onHistory(p)}
                        className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <History className="h-3 w-3" />
                        Histórico
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDelete(p)}
                      className="flex items-center justify-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                      Excluir
                    </button>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>
                  {quantityDotToBR(p.quantity)} {p.unit}
                </TableCell>
                <TableCell>
                  {quantityDotToBR(p.minQuantity)} {p.unit}
                </TableCell>
                <TableCell>{formatBRL(p.costPrice)}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatBRL(Number(p.quantity) * Number(p.costPrice))}
                </TableCell>
                <TableCell>{statusBadges(p)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

export function ProductsEmpty({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="text-center py-20 text-muted-foreground">
      <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
      <p>
        {hasSearch
          ? "Nenhum produto encontrado para a busca."
          : "Nenhum produto cadastrado."}
      </p>
    </div>
  );
}
