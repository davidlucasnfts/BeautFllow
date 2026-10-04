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

  const btn = "text-[11px] font-medium px-2 py-1 rounded-md border transition-colors";

  const primaryActions = (p: ProductForList) => (
    <div className="flex flex-col gap-1" onClick={e => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => onEdit(p)}
        className={`${btn} flex items-center gap-1 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100`}
      >
        <Edit3 className="h-3 w-3" />
        Editar
      </button>
      <button
        type="button"
        onClick={() => onMove(p, "in")}
        className={`${btn} flex items-center gap-1 border-green-200 bg-green-50 text-green-700 hover:bg-green-100`}
      >
        <ArrowDownToLine className="h-3 w-3" />
        Entrada
      </button>
      <button
        type="button"
        onClick={() => onMove(p, "out")}
        className={`${btn} flex items-center gap-1 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100`}
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
        className={`${btn} flex items-center gap-1 border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100`}
      >
        <History className="h-3 w-3" />
        Histórico
      </button>
      <button
        type="button"
        onClick={() => onDelete(p)}
        className={`${btn} flex items-center gap-1 border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
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
                <div className="mx-3 mb-3 space-y-2 rounded-lg border border-primary/40 p-3">
                  {detail(p)}
                  <div className="flex items-center justify-between gap-2">
                    {secondaryActions(p)}
                    <button
                      type="button"
                      onClick={() => setExpandedId(null)}
                      className="flex items-center gap-1 rounded-md px-3 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-slate-100 transition-colors"
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

      {/* Desktop: tabela — 5 colunas, clique expande faixa de detalhe */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Ações</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map(p => {
              const expanded = expandedId === p.id;
              return (
                <Fragment key={p.id}>
                  <TableRow
                    className={`cursor-pointer ${
                      expanded ? "bg-primary/5" : "hover:bg-blue-50/50"
                    }`}
                    onClick={() => setExpandedId(expanded ? null : p.id)}
                  >
                    <TableCell>{primaryActions(p)}</TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>
                      <p
                        className={`font-medium ${isLow(p) ? "text-amber-600" : ""}`}
                      >
                        {quantityDotToBR(p.quantity)} {p.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        mín. {quantityDotToBR(p.minQuantity)} {p.unit}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <p className="font-medium">{formatBRL(p.costPrice)}/un</p>
                      <p className="text-xs text-muted-foreground">
                        investido{" "}
                        {formatBRL(Number(p.quantity) * Number(p.costPrice))}
                      </p>
                    </TableCell>
                    <TableCell>{statusBadges(p)}</TableCell>
                  </TableRow>
                  {expanded && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={5}>
                        <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/40 p-3">
                          {detail(p)}
                          <div className="flex shrink-0 flex-col gap-2">
                            {secondaryActions(p)}
                            <button
                              type="button"
                              onClick={() => setExpandedId(null)}
                              className="flex items-center justify-center gap-1 rounded-md px-3 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-slate-100 transition-colors"
                            >
                              Fechar
                            </button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
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
