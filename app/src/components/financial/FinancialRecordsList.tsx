import { Fragment, useState } from "react";
import { format } from "date-fns";
import { Edit3, Trash2, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import FinancialRecordExpanded, {
  type FinancialRecordForList,
} from "./FinancialRecordExpanded";

interface FinancialRecordsListProps {
  isLoading: boolean;
  isError: boolean;
  records: FinancialRecordForList[];
  /** true quando a lista vazia é resultado de busca (mensagem muda) */
  searchActive?: boolean;
  clients: { id: number; name: string }[];
  professionals: { id: number; name: string }[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  onEdit: (record: FinancialRecordForList) => void;
  onDelete: (record: FinancialRecordForList) => void;
}

function formatBRL(value: string | number) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const PER_PAGE = 20;

/** Lista de lançamentos: tabela no desktop, lista estilo Fila do Dia no mobile
 *  (tabela estoura a largura no celular e esconde o valor — padrão do app). */
export default function FinancialRecordsList({
  isLoading,
  isError,
  records,
  searchActive = false,
  clients,
  professionals,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: FinancialRecordsListProps) {
  // paginação: meses com muitos lançamentos ficam fluidos (20 por página)
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(records.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageRecords = records.slice(
    (safePage - 1) * PER_PAGE,
    safePage * PER_PAGE
  );

  const clientNameOf = (id: number | null) =>
    id ? (clients.find(c => c.id === id)?.name ?? "-") : "-";
  const professionalNameOf = (id: number | null) =>
    id ? (professionals.find(p => p.id === id)?.name ?? "-") : "-";

  const actions = (r: FinancialRecordForList) => (
    <div className="flex flex-col gap-1" onClick={e => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => onEdit(r)}
        className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
      >
        <Edit3 className="h-3 w-3" />
        Editar
      </button>
      <button
        type="button"
        onClick={() => onDelete(r)}
        className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
      >
        <Trash2 className="h-3 w-3" />
        Excluir
      </button>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Registros do mês</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-40 w-full bg-muted" />
        ) : isError ? (
          <div className="text-center py-12 text-red-600">
            <p className="text-sm">
              Erro ao carregar os registros. Atualize a página.
            </p>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p>
              {searchActive
                ? "Nenhum resultado para a busca."
                : "Nenhum registro neste mês."}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: lista com valor visível (padrão Fila do Dia) */}
            <div className="md:hidden divide-y rounded-lg border">
              {pageRecords.map(r => {
                const expanded = selectedId === r.id;
                return (
                  <Fragment key={r.id}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelect(expanded ? null : r.id)}
                      onKeyDown={e => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onSelect(expanded ? null : r.id);
                        }
                      }}
                      className={`flex w-full cursor-pointer items-center gap-3 p-3 text-left transition-colors ${
                        expanded ? "bg-primary/5" : "hover:bg-blue-50/50"
                      }`}
                    >
                      {actions(r)}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {r.description ?? "Sem descrição"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.recordDate
                            ? format(new Date(r.recordDate), "dd/MM/yyyy")
                            : "Sem data"}{" "}
                          · {r.paymentMethod.replace("_", " ")}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 text-sm font-semibold ${
                          r.type === "refund"
                            ? "text-rose-500"
                            : "text-emerald-600"
                        }`}
                      >
                        {r.type === "refund" ? "-" : ""}
                        {formatBRL(r.amount)}
                      </span>
                    </div>
                    {expanded && (
                      <div className="px-3 pb-3">
                        <FinancialRecordExpanded
                          record={r}
                          clientName={clientNameOf(r.clientId)}
                          professionalName={professionalNameOf(
                            r.professionalId
                          )}
                          onClose={() => onSelect(null)}
                        />
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
                    <TableHead className="w-24">Ações</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRecords.map(r => {
                    const expanded = selectedId === r.id;
                    return (
                      <Fragment key={r.id}>
                        <TableRow
                          className={`cursor-pointer ${
                            expanded ? "bg-primary/5" : "hover:bg-blue-50/50"
                          }`}
                          onClick={() => onSelect(expanded ? null : r.id)}
                        >
                          <TableCell>{actions(r)}</TableCell>
                          <TableCell>
                            {r.recordDate
                              ? format(new Date(r.recordDate), "dd/MM/yyyy")
                              : "-"}
                          </TableCell>
                          <TableCell className="font-medium">
                            {r.description}
                          </TableCell>
                          <TableCell>{clientNameOf(r.clientId)}</TableCell>
                          <TableCell className="capitalize">
                            {r.paymentMethod.replace("_", " ")}
                          </TableCell>
                          <TableCell
                            className={`text-right font-medium ${r.type === "refund" ? "text-rose-500" : "text-emerald-600"}`}
                          >
                            {r.type === "refund" ? "-" : ""}
                            {formatBRL(r.amount)}
                          </TableCell>
                        </TableRow>
                        {expanded && (
                          <TableRow className="bg-primary/5 hover:bg-primary/5">
                            <TableCell colSpan={6} className="p-0">
                              <FinancialRecordExpanded
                                record={r}
                                clientName={clientNameOf(r.clientId)}
                                professionalName={professionalNameOf(
                                  r.professionalId
                                )}
                                onClose={() => onSelect(null)}
                              />
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4 text-xs text-muted-foreground">
                <button
                  type="button"
                  disabled={safePage === 1}
                  onClick={() => {
                    setPage(safePage - 1);
                    onSelect(null);
                  }}
                  className="flex items-center gap-1 rounded-md border px-2.5 py-1.5 transition-colors hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Anterior
                </button>
                <span>
                  Página {safePage} de {totalPages}
                </span>
                <button
                  type="button"
                  disabled={safePage === totalPages}
                  onClick={() => {
                    setPage(safePage + 1);
                    onSelect(null);
                  }}
                  className="flex items-center gap-1 rounded-md border px-2.5 py-1.5 transition-colors hover:bg-slate-50 disabled:opacity-40"
                >
                  Próxima
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
