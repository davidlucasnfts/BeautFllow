import { useState } from "react";
import { addMonths } from "date-fns";
import { Cake, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";

/** Widget de aniversariantes com navegação livre entre meses */
export function BirthdayWidget() {
  const { salon } = useSalon();
  const { data: clients, isLoading } = trpc.customer.list.useQuery(
    { salonId: salon?.id ?? 0, limit: 1000 },
    { enabled: !!salon }
  );

  const [monthOffset, setMonthOffset] = useState(0);
  const selectedMonth = addMonths(new Date(), monthOffset);
  const monthLabel = selectedMonth.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const birthdays = (clients ?? [])
    .filter(
      (c): c is typeof c & { birthDate: string } =>
        !!c.birthDate &&
        Number(c.birthDate.slice(5, 7)) === selectedMonth.getMonth() + 1
    )
    .sort((a, b) =>
      a.birthDate.slice(8, 10).localeCompare(b.birthDate.slice(8, 10))
    );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-serif flex items-center gap-2">
          <Cake className="h-4 w-4 text-primary" />
          Aniversariantes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setMonthOffset(o => o - 1)}
            aria-label="Mês anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold capitalize text-center">
            {monthLabel}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setMonthOffset(o => o + 1)}
            aria-label="Próximo mês"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <Skeleton className="h-24 w-full bg-muted" />
        ) : birthdays.length > 0 ? (
          <ul className="space-y-2">
            {birthdays.map(client => (
              <li
                key={client.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary text-sm font-semibold shrink-0">
                  {Number(client.birthDate.slice(8, 10))}
                </span>
                <span className="text-sm font-medium break-words">
                  {client.name}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum aniversariante em {monthLabel}.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
