import { Fragment, useState, useMemo } from "react";
import { format, startOfWeek, addDays, addMonths } from "date-fns";
import {
  Edit3,
  Trash2,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Search,
  CalendarDays,
  CalendarRange,
  Calendar,
  Plus,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import PeriodNavigator, {
  type Period,
  type WeekStats,
} from "@/components/PeriodNavigator";
import { dateToBR, toISODate } from "@/lib/input-masks";
import FinancialRecordExpanded, {
  type FinancialRecordForList,
} from "./FinancialRecordExpanded";

export type FinancialPeriod = Period;

interface FinancialRecordsListProps {
  isLoading: boolean;
  isError: boolean;
  records: FinancialRecordForList[];
  /** true quando a lista vazia é resultado de busca (mensagem muda) */
  searchActive?: boolean;
  search: string;
  onSearch: (value: string) => void;
  /** período do filtro (dia/semana/mês) — mesmo padrão de visão da agenda */
  period: FinancialPeriod;
  onPeriod: (period: FinancialPeriod) => void;
  /** dia de referência do período (hoje por padrão) */
  anchor: Date;
  onAnchor: (date: Date) => void;
  /** lançamentos do mês da âncora — totais por semana no popup do período */
  monthRecords: {
    recordDate: string | Date;
    amount: string | number;
    type: string;
  }[];
  /** abre o dialog de novo lançamento (botão fica aqui, padrão agenda) */
  onNew: () => void;
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
  search,
  onSearch,
  period,
  onPeriod,
  anchor,
  onAnchor,
  monthRecords,
  onNew,
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

  // passo das setas ‹ › conforme o período (dia → ±1 dia, semana → ±7, mês → ±1 mês)
  function stepAnchor(amount: number) {
    if (period === "month") onAnchor(addMonths(anchor, amount));
    else onAnchor(addDays(anchor, amount * (period === "week" ? 7 : 1)));
  }

  // totais por semana do mês da âncora (popup da visão Semana)
  const weekStats = useMemo(() => {
    const map = new Map<string, WeekStats>();
    for (const r of monthRecords) {
      const d = new Date(`${toISODate(r.recordDate)}T00:00:00`);
      const key = format(startOfWeek(d, { weekStartsOn: 1 }), "yyyy-MM-dd");
      const s = map.get(key) ?? { count: 0, total: 0 };
      s.count += 1;
      s.total +=
        r.type === "refund" ? -Math.abs(Number(r.amount)) : Number(r.amount);
      map.set(key, s);
    }
    return map;
  }, [monthRecords]);

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
        <CardTitle className="text-base">
          {period === "day"
            ? "Registros do dia"
            : period === "week"
              ? "Registros da semana"
              : "Registros do mês"}
        </CardTitle>
        {/* Barra no padrão da agenda (mockup financeiro-seletor-periodo.html):
            linha 1 = visão + (desktop) navegação central + busca + Novo;
            linha 2 (mobile) = navegação central; busca ocupa a linha de baixo */}
        <div className="flex w-full flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-md overflow-hidden">
              <button
                type="button"
                onClick={() => onPeriod("day")}
                className={`flex items-center h-8 px-2.5 text-xs font-medium transition-colors ${
                  period === "day"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-accent"
                }`}
              >
                <CalendarDays className="h-3.5 w-3.5 mr-1" />
                Dia
              </button>
              <button
                type="button"
                onClick={() => onPeriod("week")}
                className={`flex items-center h-8 px-2.5 text-xs font-medium transition-colors ${
                  period === "week"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-accent"
                }`}
              >
                <CalendarRange className="h-3.5 w-3.5 mr-1" />
                Semana
              </button>
              <button
                type="button"
                onClick={() => onPeriod("month")}
                className={`flex items-center h-8 px-2.5 text-xs font-medium transition-colors ${
                  period === "month"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-accent"
                }`}
              >
                <Calendar className="h-3.5 w-3.5 mr-1" />
                Mês
              </button>
            </div>
            <div className="hidden md:block md:pl-1">
              <PeriodNavigator
                period={period}
                anchor={anchor}
                onStep={stepAnchor}
                onPick={onAnchor}
                weekStats={weekStats}
              />
            </div>
            <div className="grow" />
            <div className="relative hidden sm:block w-56">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={e => onSearch(e.target.value)}
                placeholder="Buscar descrição ou cliente"
                className="pl-8 h-8 text-xs"
              />
            </div>
            <Button size="sm" onClick={onNew}>
              <Plus className="mr-1.5 h-4 w-4" /> Novo
            </Button>
          </div>
          <div className="md:hidden flex justify-center">
            <PeriodNavigator
              period={period}
              anchor={anchor}
              onStep={stepAnchor}
              onPick={onAnchor}
              weekStats={weekStats}
            />
          </div>
          <div className="relative sm:hidden">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={e => onSearch(e.target.value)}
              placeholder="Buscar descrição ou cliente"
              className="pl-8"
            />
          </div>
        </div>
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
                : period === "day"
                  ? "Nenhum registro neste dia."
                  : period === "week"
                    ? "Nenhum registro nesta semana."
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
                          {r.recordDate ? dateToBR(r.recordDate) : "Sem data"}{" "}
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
                            {r.recordDate ? dateToBR(r.recordDate) : "-"}
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
