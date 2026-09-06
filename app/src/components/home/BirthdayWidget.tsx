import { Cake } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/** Widget de aniversariantes do mês (Fase 1) */
export function BirthdayWidget() {
  const { salon } = useSalon();
  const { data: clients, isLoading } = trpc.customer.list.useQuery(
    { salonId: salon?.id ?? 0, limit: 1000 },
    { enabled: !!salon }
  );

  const currentMonth = new Date().getMonth() + 1;

  const birthdays = (clients ?? [])
    .filter(
      (c): c is typeof c & { birthDate: string } =>
        !!c.birthDate && Number(c.birthDate.slice(5, 7)) === currentMonth
    )
    .sort((a, b) => a.birthDate.slice(8, 10).localeCompare(b.birthDate.slice(8, 10)));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-serif flex items-center gap-2">
          <Cake className="h-4 w-4 text-primary" />
          Aniversariantes do mês
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
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
                <span className="text-sm font-medium truncate">
                  {client.name}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum aniversariante em{" "}
            {format(new Date(), "MMMM", { locale: ptBR })}.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
