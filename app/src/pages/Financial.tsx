import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";


export default function Financial() {
  const { salon } = useSalon();
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    clientId: "",
    professionalId: "",
    type: "service" as const,
    description: "",
    amount: "",
    commissionAmount: "",
    paymentMethod: "pix" as const,
    recordDate: format(new Date(), "yyyy-MM-dd"),
    notes: "",
  });

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

  const createMutation = trpc.financial.create.useMutation({
    onSuccess: () => {
      utils.financial.list.invalidate();
      utils.financial.summary.invalidate();
      setOpen(false);
      toast.success("Lançamento criado");
    },
    onError: (e) => toast.error(e.message),
  });

  function handleSubmit() {
    if (!salon) return;
    createMutation.mutate({
      salonId: salon.id,
      clientId: Number(form.clientId),
      professionalId: form.professionalId ? Number(form.professionalId) : undefined,
      type: form.type,
      description: form.description,
      amount: form.amount,
      commissionAmount: form.commissionAmount || undefined,
      paymentMethod: form.paymentMethod,
      recordDate: form.recordDate,
      notes: form.notes || undefined,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">Faturamento, comissões e lançamentos</p>
        </div>
        <div className="flex items-center gap-2">
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-40" />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Lançamento</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Novo Lançamento</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Cliente</Label>
                  <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{clients?.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Tipo</Label>
                    <Select value={form.type} onValueChange={(v: typeof form.type) => setForm({ ...form, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="service">Serviço</SelectItem>
                        <SelectItem value="product">Produto</SelectItem>
                        <SelectItem value="package">Pacote</SelectItem>
                        <SelectItem value="refund">Reembolso</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Data</Label>
                    <Input type="date" value={form.recordDate} onChange={(e) => setForm({ ...form, recordDate: e.target.value })} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Descrição</Label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Valor (R$)</Label>
                    <Input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Comissão (R$)</Label>
                    <Input value={form.commissionAmount} onChange={(e) => setForm({ ...form, commissionAmount: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Profissional</Label>
                    <Select value={form.professionalId} onValueChange={(v) => setForm({ ...form, professionalId: v })}>
                      <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                      <SelectContent>{professionals?.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Pagamento</Label>
                    <Select value={form.paymentMethod} onValueChange={(v: typeof form.paymentMethod) => setForm({ ...form, paymentMethod: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pix">Pix</SelectItem>
                        <SelectItem value="credit_card">Cartão Crédito</SelectItem>
                        <SelectItem value="debit_card">Cartão Débito</SelectItem>
                        <SelectItem value="cash">Dinheiro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                <Button onClick={handleSubmit} disabled={createMutation.isPending}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Líquida</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {summary ? (
              <div className="text-2xl font-bold">R$ {Number(summary.totalRevenue).toFixed(2)}</div>
            ) : <Skeleton className="h-8 w-24" />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reembolsos</CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            {summary ? (
              <div className="text-2xl font-bold">R$ {Number(summary.totalRefunds).toFixed(2)}</div>
            ) : <Skeleton className="h-8 w-24" />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comissões</CardTitle>
            <Wallet className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {summary ? (
              <div className="text-2xl font-bold">R$ {Number(summary.totalCommission).toFixed(2)}</div>
            ) : <Skeleton className="h-8 w-24" />}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lançamentos do Mês</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : records && records.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.recordDate ? format(new Date(r.recordDate), "dd/MM/yyyy") : "-"}</TableCell>
                    <TableCell className="font-medium">{r.description}</TableCell>
                    <TableCell>{clients?.find((c) => c.id === r.clientId)?.name ?? "-"}</TableCell>
                    <TableCell className="capitalize">{r.paymentMethod.replace("_", " ")}</TableCell>
                    <TableCell className={`text-right font-medium ${r.type === "refund" ? "text-rose-500" : "text-emerald-600"}`}>
                      {r.type === "refund" ? "-" : ""}R$ {Number(r.amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>Nenhum lançamento neste mês.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
