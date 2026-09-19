import { useState, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format, endOfMonth } from "date-fns";
import { moneyDotToBR } from "@/lib/input-masks";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import FinancialFormDialog, {
  type FinancialFormValues,
} from "@/components/financial/FinancialFormDialog";
import FinancialRecordsList from "@/components/financial/FinancialRecordsList";
import type { FinancialRecordForList } from "@/components/financial/FinancialRecordExpanded";

function formatBRL(value: string | number) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formFromRecord(r: FinancialRecordForList): FinancialFormValues {
  return {
    clientId: r.clientId ? String(r.clientId) : "",
    professionalId: r.professionalId ? String(r.professionalId) : "",
    type: r.type,
    description: r.description ?? "",
    amount: moneyDotToBR(String(r.amount)),
    commissionAmount: r.commissionAmount
      ? moneyDotToBR(String(r.commissionAmount))
      : "",
    paymentMethod: r.paymentMethod,
    recordDate: r.recordDate
      ? format(new Date(r.recordDate), "yyyy-MM-dd")
      : "",
    notes: r.notes ?? "",
  };
}

export default function Financial() {
  const { salon } = useSalon();
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [initialForm, setInitialForm] = useState<FinancialFormValues | null>(
    null
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const utils = trpc.useUtils();
  // fim real do mês (mês + "-31" quebra em meses de 30 dias → data inválida,
  // a query falhava em silêncio e a lista aparecia vazia)
  const monthEnd = format(
    endOfMonth(new Date(`${month}-01T00:00:00`)),
    "yyyy-MM-dd"
  );

  const { data: records, isLoading, isError } = trpc.financial.list.useQuery(
    { salonId: salon?.id ?? 0, fromDate: `${month}-01`, toDate: monthEnd },
    { enabled: !!salon }
  );

  const { data: summary } = trpc.financial.summary.useQuery(
    { salonId: salon?.id ?? 0, month },
    { enabled: !!salon }
  );

  const { data: clients } = trpc.customer.list.useQuery(
    { salonId: salon?.id ?? 0 },
    { enabled: !!salon }
  );

  const { data: professionals } = trpc.professional.list.useQuery(
    { salonId: salon?.id ?? 0 },
    { enabled: !!salon }
  );

  // busca operacional: filtra o mês selecionado por descrição ou cliente
  // (análises e comparativos ficam no Dashboard — aqui é achar um lançamento)
  const visibleRecords = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = (records ?? []) as FinancialRecordForList[];
    if (!term) return list;
    return list.filter(r => {
      const clientName = r.clientId
        ? (clients?.find(c => c.id === r.clientId)?.name ?? "")
        : "";
      return (
        (r.description ?? "").toLowerCase().includes(term) ||
        clientName.toLowerCase().includes(term)
      );
    });
  }, [records, search, clients]);

  const invalidate = () => {
    utils.financial.list.invalidate();
    utils.financial.summary.invalidate();
  };

  const createMutation = trpc.financial.create.useMutation({
    onSuccess: () => {
      invalidate();
      setOpen(false);
      toast.success("Registro criado");
    },
    onError: e => toast.error(e.message),
  });

  const updateMutation = trpc.financial.update.useMutation({
    onSuccess: () => {
      invalidate();
      setOpen(false);
      setEditing(null);
      toast.success("Registro atualizado");
    },
    onError: e => toast.error(e.message),
  });

  const deleteMutation = trpc.financial.delete.useMutation({
    onSuccess: () => {
      invalidate();
      setSelectedId(null);
      setDeleteTarget(null);
      toast.success("Registro removido");
    },
    onError: e => toast.error(e.message),
  });

  function handleNew() {
    setEditing(null);
    setInitialForm(null);
    setOpen(true);
  }

  function handleEdit(record: FinancialRecordForList) {
    setEditing(record.id);
    setInitialForm(formFromRecord(record));
    setOpen(true);
  }

  function handleDelete(record: FinancialRecordForList) {
    setDeleteTarget({
      id: record.id,
      name: `${record.description ?? "Registro"} (${record.recordDate ? format(new Date(record.recordDate), "dd/MM/yyyy") : "sem data"})`,
    });
  }

  function handleSubmit(values: FinancialFormValues) {
    if (!salon) return;
    if (editing) {
      // edição só altera valor, descrição, pagamento e data (contrato do backend)
      updateMutation.mutate({
        id: editing,
        salonId: salon.id,
        description: values.description,
        amount: values.amount,
        paymentMethod: values.paymentMethod,
        recordDate: values.recordDate,
      });
    } else {
      createMutation.mutate({
        salonId: salon.id,
        clientId: Number(values.clientId),
        professionalId: values.professionalId
          ? Number(values.professionalId)
          : undefined,
        type: values.type,
        description: values.description,
        // o dialog já converte o valor para o formato do banco
        amount: values.amount,
        commissionAmount: values.commissionAmount || undefined,
        paymentMethod: values.paymentMethod,
        recordDate: values.recordDate,
        notes: values.notes || undefined,
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">
            Seus ganhos, comissões e gastos
          </p>
        </div>
        <Button className="shrink-0" onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" /> Novo registro
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-3">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganho líquido</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {summary ? (
              <div className="text-2xl font-bold">
                {formatBRL(summary.totalRevenue)}
              </div>
            ) : (
              <Skeleton className="h-8 w-24" />
            )}
          </CardContent>
        </Card>
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reembolsos</CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            {summary ? (
              <div className="text-2xl font-bold">
                {formatBRL(summary.totalRefunds)}
              </div>
            ) : (
              <Skeleton className="h-8 w-24" />
            )}
          </CardContent>
        </Card>
        <Card className="h-full col-span-2 md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Comissões
            </CardTitle>
            <Wallet className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {summary ? (
              <div className="text-2xl font-bold">
                {formatBRL(summary.totalCommission)}
              </div>
            ) : (
              <Skeleton className="h-8 w-24" />
            )}
          </CardContent>
        </Card>
      </div>

      <FinancialRecordsList
        isLoading={isLoading}
        isError={isError}
        records={visibleRecords}
        searchActive={!!search.trim()}
        search={search}
        onSearch={setSearch}
        month={month}
        onMonth={setMonth}
        clients={clients ?? []}
        professionals={professionals ?? []}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <FinancialFormDialog
        open={open}
        onOpenChange={setOpen}
        editingId={editing}
        initial={initialForm}
        clients={clients?.map(c => ({ id: c.id, name: c.name }))}
        professionals={professionals?.map(p => ({ id: p.id, name: p.name }))}
        isPending={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
        itemType="registro financeiro"
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
