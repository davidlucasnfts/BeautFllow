import { useState, Fragment } from "react";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, DollarSign, TrendingUp, TrendingDown, Wallet, Edit3, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { moneyDotToBR } from "@/lib/input-masks";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import FinancialFormDialog, {
  type FinancialFormValues,
} from "@/components/financial/FinancialFormDialog";
import FinancialRecordExpanded, {
  type FinancialRecordForList,
} from "@/components/financial/FinancialRecordExpanded";

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
  const { data: records, isLoading } = trpc.financial.list.useQuery(
    { salonId: salon?.id ?? 0, fromDate: month + "-01", toDate: month + "-31" },
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">
            Seus ganhos, comissões e gastos
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            type="month"
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="flex-1 sm:flex-none sm:w-40"
          />
          <Button className="shrink-0" onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" /> Novo registro
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
        <Card className="h-full">
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registros do mês</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 w-full bg-muted" />
          ) : records && records.length > 0 ? (
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
                {records.map(r => {
                  const record = r as FinancialRecordForList;
                  const expanded = selectedId === record.id;
                  const clientName =
                    clients?.find(c => c.id === record.clientId)?.name ?? "-";
                  const professionalName = record.professionalId
                    ? (professionals?.find(p => p.id === record.professionalId)
                        ?.name ?? "-")
                    : "-";
                  return (
                    <Fragment key={record.id}>
                      <TableRow
                        className={`cursor-pointer ${
                          expanded ? "bg-primary/5" : "hover:bg-blue-50/50"
                        }`}
                        onClick={() =>
                          setSelectedId(expanded ? null : record.id)
                        }
                      >
                        <TableCell onClick={e => e.stopPropagation()}>
                          <div className="flex flex-col gap-1">
                            <button
                              type="button"
                              onClick={() => handleEdit(record)}
                              className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            >
                              <Edit3 className="h-3 w-3" />
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget({
                                  id: record.id,
                                  name: `${record.description ?? "Registro"} (${record.recordDate ? format(new Date(record.recordDate), "dd/MM/yyyy") : "sem data"})`,
                                })
                              }
                              className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                              Excluir
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {record.recordDate
                            ? format(new Date(record.recordDate), "dd/MM/yyyy")
                            : "-"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {record.description}
                        </TableCell>
                        <TableCell>{clientName}</TableCell>
                        <TableCell className="capitalize">
                          {record.paymentMethod.replace("_", " ")}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${record.type === "refund" ? "text-rose-500" : "text-emerald-600"}`}
                        >
                          {record.type === "refund" ? "-" : ""}
                          {formatBRL(record.amount)}
                        </TableCell>
                      </TableRow>
                      {expanded && (
                        <TableRow className="bg-primary/5 hover:bg-primary/5">
                          <TableCell colSpan={6} className="p-0">
                            <FinancialRecordExpanded
                              record={record}
                              clientName={clientName}
                              professionalName={professionalName}
                              onClose={() => setSelectedId(null)}
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>Nenhum registro neste mês.</p>
            </div>
          )}
        </CardContent>
      </Card>

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
