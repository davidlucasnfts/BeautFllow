import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  CalendarRange,
  Calendar,
} from "lucide-react";
import {
  addDays,
  addMonths,
  startOfWeek,
  differenceInCalendarWeeks,
} from "date-fns";
import PeriodNavigator from "@/components/PeriodNavigator";
import { cn } from "@/lib/utils";
import type { ViewMode } from "@/components/calendar/types";
import type { Professional, Service } from "@db/schema";

interface AppointmentFiltersProps {
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  weekOffset: number;
  setWeekOffset: (fn: (o: number) => number) => void;
  monthOffset: number;
  setMonthOffset: (fn: (o: number) => number) => void;
  selectedDate: Date;
  setSelectedDate: (fn: (d: Date) => Date) => void;
  filterProfessional: string;
  setFilterProfessional: (v: string) => void;
  filterService: string;
  setFilterService: (v: string) => void;
  professionals?: Professional[];
  services?: Service[];
}

const chipBase =
  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors";
const chipActive = "border-transparent bg-primary text-primary-foreground";
const chipIdle = "bg-background hover:bg-accent";

/** Filtros da agenda: visão (Dia/Semana/Mês) + navegação de período centralizados,
 *  chips de profissional abaixo. O botão Novo agendamento fica no cabeçalho da
 *  página (mesmo padrão do Dashboard). */
export default function AppointmentFilters({
  viewMode,
  setViewMode,
  weekOffset,
  setWeekOffset,
  monthOffset,
  setMonthOffset,
  selectedDate,
  setSelectedDate,
  filterProfessional,
  setFilterProfessional,
  filterService,
  setFilterService,
  professionals,
  services,
}: AppointmentFiltersProps) {
  const today = new Date();
  const weekStart = startOfWeek(addDays(today, weekOffset * 7), {
    weekStartsOn: 1,
  });
  const monthCursor = addMonths(today, monthOffset);

  function stepPrev() {
    if (viewMode === "day") setSelectedDate(d => addDays(d, -1));
    else if (viewMode === "week") setWeekOffset(o => o - 1);
    else setMonthOffset(o => o - 1);
  }

  function stepNext() {
    if (viewMode === "day") setSelectedDate(d => addDays(d, 1));
    else if (viewMode === "week") setWeekOffset(o => o + 1);
    else setMonthOffset(o => o + 1);
  }

  // Centro clicável abre o seletor de período e pula direto pro dia/semana/mês
  // escolhido (padrão "real" do sistema — PeriodNavigator)
  function jumpToDate(chosen: Date) {
    if (viewMode === "day") {
      setSelectedDate(() => chosen);
    } else if (viewMode === "week") {
      const thisWeek = startOfWeek(today, { weekStartsOn: 1 });
      setWeekOffset(
        () =>
          differenceInCalendarWeeks(chosen, thisWeek, { weekStartsOn: 1 })
      );
    } else {
      setMonthOffset(
        () =>
          (chosen.getFullYear() - today.getFullYear()) * 12 +
          (chosen.getMonth() - today.getMonth())
      );
    }
  }

  const nav = (
    <PeriodNavigator
      period={viewMode}
      anchor={
        viewMode === "day"
          ? selectedDate
          : viewMode === "week"
            ? weekStart
            : monthCursor
      }
      onStep={amount => (amount < 0 ? stepPrev() : stepNext())}
      onPick={jumpToDate}
    />
  );

  return (
    <div className="flex w-full flex-col gap-2">
      {/* Visão + navegação centralizadas (mobile e desktop) */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center border rounded-md overflow-hidden">
          <Button
            variant={viewMode === "day" ? "default" : "ghost"}
            size="sm"
            className="rounded-none h-8 px-3"
            onClick={() => setViewMode("day")}
          >
            <CalendarDays className="h-4 w-4 mr-1.5" />
            Dia
          </Button>
          <Button
            variant={viewMode === "week" ? "default" : "ghost"}
            size="sm"
            className="rounded-none h-8 px-3"
            onClick={() => setViewMode("week")}
          >
            <CalendarRange className="h-4 w-4 mr-1.5" />
            Semana
          </Button>
          <Button
            variant={viewMode === "month" ? "default" : "ghost"}
            size="sm"
            className="rounded-none h-8 px-3"
            onClick={() => setViewMode("month")}
          >
            <Calendar className="h-4 w-4 mr-1.5" />
            Mês
          </Button>
        </div>
        {viewMode !== "day" && nav}
      </div>

      {/* Linha 2: chips de profissional com cor (dia/semana, mobile + desktop) */}
      {viewMode !== "month" && (
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setFilterProfessional("all")}
              className={cn(
                chipBase,
                "shrink-0",
                filterProfessional === "all" ? chipActive : chipIdle
              )}
            >
              Todos
            </button>
            <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto py-0.5 pr-1">
              {professionals?.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setFilterProfessional(String(p.id))}
                  className={cn(
                    chipBase,
                    "shrink-0",
                    filterProfessional === String(p.id) ? chipActive : chipIdle
                  )}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: p.color ?? "#ccc" }}
                  />
                  {p.name}
                </button>
              ))}
            </div>
            <div className="absolute right-0 hidden md:block">
              <Select value={filterService} onValueChange={setFilterService}>
                <SelectTrigger className="w-[160px] h-8 text-xs">
                  <SelectValue placeholder="Serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos serviços</SelectItem>
                  {services?.map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: s.color ?? "#ccc" }}
                        />
                        {s.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Visão mês (desktop): filtros em select — chips ficam só em dia/semana */}
      {viewMode === "month" && (
        <div className="hidden md:flex items-center gap-2">
          <Select
            value={filterProfessional}
            onValueChange={setFilterProfessional}
          >
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="Profissional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos profissionais</SelectItem>
              {professionals?.map(p => (
                <SelectItem key={p.id} value={String(p.id)}>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: p.color ?? "#ccc" }}
                    />
                    {p.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterService} onValueChange={setFilterService}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="Serviço" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos serviços</SelectItem>
              {services?.map(s => (
                <SelectItem key={s.id} value={String(s.id)}>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: s.color ?? "#ccc" }}
                    />
                    {s.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

