import { useState, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays, Scissors } from "lucide-react";

function formatBRL(value: string | number) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

type ProfessionalOption = {
  id: number;
  name: string;
};

interface ProfessionalPerformanceProps {
  professionals: ProfessionalOption[];
}

export default function ProfessionalPerformance({
  professionals,
}: ProfessionalPerformanceProps) {
  const { salon } = useSalon();
  const [selectedId, setSelectedId] = useState<string>(
    String(professionals[0]?.id ?? "")
  );
  const [anchor, setAnchor] = useState(new Date());

  const range = useMemo(
    () => ({
      fromDate: format(startOfMonth(anchor), "yyyy-MM-dd"),
      toDate: format(endOfMonth(anchor), "yyyy-MM-dd"),
    }),
    [anchor]
  );

  const professionalId = Number(selectedId);

  const { data: performance, isLoading } = trpc.commission.performance.useQuery(
    {
      salonId: salon?.id ?? 0,
      professionalId,
      ...range,
    },
    { enabled: !!salon && !!professionalId }
  );

  const { data: summary } = trpc.commission.summary.useQuery(
    {
      salonId: salon?.id ?? 0,
      professionalId,
      ...range,
    },
    { enabled: !!salon && !!professionalId }
  );

  const proSummary = summary?.[0];

  const totals = useMemo(() => {
    if (!performance) return null;
    const totalAmount = performance.appointments.reduce(
      (acc, a) => acc + Number(a.amount),
      0
    );
    const totalCommission = performance.appointments.reduce(
      (acc, a) => acc + Number(a.commissionAmount),
      0
    );
    return {
      count: performance.appointments.length,
      totalAmount,
      totalCommission,
      balance: Number(proSummary?.balance ?? 0),
    };
  }, [performance, proSummary]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Escolha o profissional" />
            </SelectTrigger>
            <SelectContent>
              {professionals.map(p => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAnchor(addMonths(anchor, -1))}
            className="flex h-8 w-8 items-center justify-center rounded-md border hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium min-w-[100px] text-center capitalize">
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Atendimentos
              </CardTitle>
              <Scissors className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totals?.count ?? 0}</div>
            </CardContent>
          </Card>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faturado</CardTitle>
              <span className="text-emerald-500 font-bold">R$</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatBRL(totals?.totalAmount ?? 0)}
              </div>
            </CardContent>
          </Card>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comissão</CardTitle>
              <span className="text-amber-500 font-bold">%</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatBRL(totals?.totalCommission ?? 0)}
              </div>
            </CardContent>
          </Card>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">A pagar</CardTitle>
              <span className="text-rose-500 font-bold">R$</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatBRL(totals?.balance ?? 0)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Atendimentos concluídos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 w-full bg-muted" />
          ) : performance?.appointments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>Nenhum atendimento concluído neste período.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Comissão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performance?.appointments.map(a => (
                    <TableRow key={a.id}>
                      <TableCell>
                        {new Date(
                          `${a.appointmentDate}T00:00:00`
                        ).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>{a.startTime?.slice(0, 5)}</TableCell>
                      <TableCell>{a.clientName ?? "Cliente"}</TableCell>
                      <TableCell>{a.serviceName ?? "Serviço"}</TableCell>
                      <TableCell className="text-right">
                        {formatBRL(a.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatBRL(a.commissionAmount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
