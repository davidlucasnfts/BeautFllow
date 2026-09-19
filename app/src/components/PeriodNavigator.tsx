import { useState } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  addDays,
  addMonths,
  addYears,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import DatePicker from "@/components/DatePicker";

export type Period = "day" | "week" | "month";

export interface WeekStats {
  count: number;
  total: number;
}

interface PeriodNavigatorProps {
  period: Period;
  /** data de referência do período exibido */
  anchor: Date;
  /** setas ‹ › — o pai aplica o passo no período dele */
  onStep: (amount: number) => void;
  /** escolha em qualquer um dos popups (dia/semana/mês) — recebe a data escolhida */
  onPick: (date: Date) => void;
  /** totais por semana (chave = yyyy-mm-dd da segunda) — só visão Semana;
   *  sem isso o popup mostra apenas os intervalos de data */
  weekStats?: Map<string, WeekStats>;
}

/** Semanas (seg–dom) que intersectam o mês da âncora */
function weeksOfMonth(anchor: Date) {
  const first = startOfMonth(anchor);
  // última semana = a que contém o último dia do mês
  const lastDayOfMonth = addDays(startOfMonth(addMonths(first, 1)), -1);
  const last = startOfWeek(lastDayOfMonth, { weekStartsOn: 1 });
  const weeks: { start: Date; end: Date }[] = [];
  let week = startOfWeek(first, { weekStartsOn: 1 });
  while (week <= last) {
    weeks.push({ start: week, end: endOfWeek(week, { weekStartsOn: 1 }) });
    week = addDays(week, 7);
  }
  return weeks;
}

function capitalizeFirst(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function moneyBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Navegação de período padrão do sistema (Agendamento, Financeiro e
 *  telas futuras com visão Dia/Semana/Mês) — mesmo layout do centro da
 *  barra: setas ‹ › + rótulo clicável. O popup segue a unidade da visão:
 *  Dia abre a grade de dias, Semana abre a lista de semanas do mês (com
 *  totais quando weekStats é informado) e Mês abre a grade de 12 meses +
 *  ano (estilo iOS). Aprovado no mockup docs/mockups/financeiro-seletor-periodo.html */
export default function PeriodNavigator({
  period,
  anchor,
  onStep,
  onPick,
  weekStats,
}: PeriodNavigatorProps) {
  const [open, setOpen] = useState(false);

  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(anchor, { weekStartsOn: 1 });

  const navButton =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-input bg-background transition-colors hover:bg-slate-50";

  const triggerClass =
    "h-8 justify-center gap-1.5 px-2.5 text-xs font-medium w-auto";

  let picker: React.ReactNode;
  if (period === "day") {
    picker = (
      <DatePicker
        value={format(anchor, "yyyy-MM-dd")}
        onChange={iso => onPick(new Date(`${iso}T00:00:00`))}
        label={format(anchor, "dd/MM/yyyy")}
        className={triggerClass}
      />
    );
  } else if (period === "week") {
    picker = (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={triggerClass}
            aria-label="Escolher semana"
          >
            <span className="whitespace-nowrap">
              {format(weekStart, "dd/MM")} – {format(weekEnd, "dd/MM")}
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="center">
          <div className="mb-1 flex items-center justify-between">
            <button
              type="button"
              aria-label="Mês anterior"
              className={navButton}
              onClick={() => onPick(addMonths(anchor, -1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-semibold capitalize">
              {format(anchor, "MMMM yyyy", { locale: ptBR })}
            </span>
            <button
              type="button"
              aria-label="Próximo mês"
              className={navButton}
              onClick={() => onPick(addMonths(anchor, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          {weeksOfMonth(anchor).map(w => {
            const key = format(w.start, "yyyy-MM-dd");
            const stats = weekStats?.get(key);
            const selected = format(weekStart, "yyyy-MM-dd") === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onPick(w.start);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-xs transition-colors ${
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="font-medium">
                  {format(w.start, "dd/MM")} – {format(w.end, "dd/MM")}
                </span>
                <span className={selected ? "opacity-80" : "text-slate-400"}>
                  {stats
                    ? `${stats.count} ${stats.count === 1 ? "registro" : "registros"} · ${moneyBRL(stats.total)}`
                    : ""}
                </span>
              </button>
            );
          })}
        </PopoverContent>
      </Popover>
    );
  } else {
    picker = (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={triggerClass}
            aria-label="Escolher mês"
          >
            <span className="whitespace-nowrap">
              {capitalizeFirst(
                format(anchor, "MMMM 'de' yyyy", { locale: ptBR })
              )}
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="center">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label="Ano anterior"
              className={navButton}
              onClick={() => onPick(addYears(anchor, -1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-semibold">
              {format(anchor, "yyyy")}
            </span>
            <button
              type="button"
              aria-label="Próximo ano"
              className={navButton}
              onClick={() => onPick(addYears(anchor, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {Array.from({ length: 12 }, (_, i) => {
              const selected = anchor.getMonth() === i;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onPick(new Date(anchor.getFullYear(), i, 1));
                    setOpen(false);
                  }}
                  className={`rounded-md py-2 text-xs transition-colors ${
                    selected
                      ? "bg-primary font-semibold text-primary-foreground"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {capitalizeFirst(
                    format(new Date(2020, i, 1), "MMM", { locale: ptBR })
                  )}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        aria-label="Período anterior"
        className={navButton}
        onClick={() => onStep(-1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {picker}
      <button
        type="button"
        aria-label="Próximo período"
        className={navButton}
        onClick={() => onStep(1)}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
