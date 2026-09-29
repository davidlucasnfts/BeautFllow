import { useState, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { ChevronLeft, ChevronRight, DollarSign } from "lucide-react";
import { moneyBRToDot, moneyDotToBR, maskMoneyBR } from "@/lib/input-masks";

function formatBRL(value: string | number) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const PAYMENT_OPTIONS = [
  { value: "pix", label: "Pix" },
  { value: "cash", label: "Dinheiro" },
  { value: "credit_card", label: "Cartão de crédito" },
  { value: "debit_card", label: "Cartão de débito" },
];

type ProfessionalOption = {
  id: number;
  name: string;
  commissionRate: string;
};

interface CommissionsViewProps {
  /** não é mais necessário — profissionais vêm do resumo do backend */
}

export default function CommissionsView(_props: CommissionsViewProps) {
  const { salon } = useSalon();
  const utils = trpc.useUtils();
  const [anchor, setAnchor] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [selectedPro, setSelectedPro] = useState<ProfessionalOption | null>(null);

  const range = useMemo(
    () => ({
      fromDate: format(startOfMonth(anchor), "yyyy-MM-dd"),
      toDate: format(endOfMonth(anchor), "yyyy-MM-dd"),
    }),
    [anchor]
  );

  const { data: summary, isLoading } = trpc.commission.summary.useQuery(
    { salonId: salon?.id ?? 0, ...range },
    { enabled: !!salon }
  );

  const { data: payments, isLoading: paymentsLoading } =
    trpc.commission.payments.useQuery(
      { salonId: salon?.id ?? 0 },
      { enabled: !!salon }
    );

  function handlePay(pro: NonNullable<typeof summary>[number]) {
    setSelectedPro({
      id: pro.professionalId,
      name: pro.name,
      commissionRate: pro.commissionRate,
    });
    setOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Comissões do mês</h2>
          <p className="text-sm text-muted-foreground">
            Valores devidos e pagamentos já feitos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAnchor(addMonths(anchor, -1))}
            className="flex h-8 w-8 items-center justify-center rounded-md border hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium min-w-[100px] text-center">
            {format(anchor, "MMMM/yyyy", { locale: undefined })}
          </span>
          <button
            type="button"
            onClick={() => setAnchor(addMonths(anchor, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-md border hover:bg-slate-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 bg-muted" />
          ))}
        </div>
      ) : summary?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nenhum profissional cadastrado para calcular comissões.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {summary?.map(pro => (
            <Card key={pro.professionalId} className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">
                  {pro.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Comissão {Number(pro.commissionRate)}%
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Devido</p>
                    <p className="font-semibold">
                      {formatBRL(pro.totalCommission)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pago</p>
                    <p className="font-semibold">
                      {formatBRL(pro.totalPaid)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
                  <span className="text-sm font-medium">A pagar</span>
                  <span
                    className={`font-bold ${
                      Number(pro.balance) > 0 ? "text-amber-600" : "text-emerald-600"
                    }`}
                  >
                    {formatBRL(pro.balance)}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => handlePay(pro)}
                >
                  <DollarSign className="mr-1.5 h-4 w-4" />
                  Pagar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico de pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentsLoading ? (
            <Skeleton className="h-32 w-full bg-muted" />
          ) : (payments ?? []).length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p>Nenhum pagamento registrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Forma</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments?.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>{p.professionalName}</TableCell>
                      <TableCell>
                        {new Date(`${p.paidAt}T00:00:00`).toLocaleDateString(
                          "pt-BR"
                        )}
                      </TableCell>
                      <TableCell className="capitalize">
                        {p.paymentMethod.replace("_", " ")}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatBRL(p.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPro && (
        <PaymentDialog
          open={open}
          onOpenChange={setOpen}
          professional={selectedPro}
          balance={
            summary?.find(s => s.professionalId === selectedPro.id)?.balance ??
            "0.00"
          }
          onSuccess={() => {
            utils.commission.summary.invalidate();
            utils.commission.payments.invalidate();
          }}
        />
      )}
    </div>
  );
}

function PaymentDialog({
  open,
  onOpenChange,
  professional,
  balance,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  professional: ProfessionalOption;
  balance: string;
  onSuccess: () => void;
}) {
  const { salon } = useSalon();
  const [amount, setAmount] = useState(() => moneyDotToBR(balance));
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [paidAt, setPaidAt] = useState(format(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");

  const payMutation = trpc.commission.pay.useMutation({
    onSuccess: () => {
      toast.success("Pagamento registrado");
      onSuccess();
      onOpenChange(false);
    },
    onError: e => toast.error(e.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!salon) return;
    const dot = moneyBRToDot(amount);
    if (Number(dot) <= 0) {
      toast.error("Informe um valor maior que zero.");
      return;
    }
    payMutation.mutate({
      salonId: salon.id,
      professionalId: professional.id,
      amount: dot,
      paymentMethod: paymentMethod as
        | "pix"
        | "cash"
        | "credit_card"
        | "debit_card",
      paidAt,
      notes: notes || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pagar {professional.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Valor sugerido (saldo)</Label>
            <Input
              inputMode="numeric"
              value={amount}
              onChange={e => setAmount(maskMoneyBR(e.target.value, 7))}
              placeholder="0,00"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Forma de pagamento</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Data do pagamento</Label>
            <Input
              type="date"
              value={paidAt}
              onChange={e => setPaidAt(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Input
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Opcional"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={payMutation.isPending}>
              {payMutation.isPending ? "Salvando..." : "Confirmar pagamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
