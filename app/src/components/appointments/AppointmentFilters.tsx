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
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import {
  format,
  addDays,
  addMonths,
  startOfWeek,
  endOfWeek,
  differenceInCalendarWeeks,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import DatePicker from "@/components/DatePicker";
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
  onNew: () => void;
}

const chipBase =
  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors";
const chipActive = "border-transparent bg-primary text-primary-foreground";
const chipIdle = "bg-background hover:bg-accent";

/** Filtros da agenda no padrão Opção 5 (mockup docs/mockups/agendamento-seletor-visao.html):
 *  linha 1 = visão + (desktop) navegação central + Novo; linha 2 = navegação no
 *  mobile; linha 3 = chips de profissional com cor (visões dia/semana). */
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
  onNew,
}: AppointmentFiltersProps) {
  const today = new Date();
  const weekStart = startOfWeek(addDays(today, weekOffset * 7), {
    weekStartsOn: 1,
  });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
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

  // Centro clicável abre o DatePicker e pula direto pro dia/semana/mês escolhido
  function jumpTo(iso: string) {
    const chosen = new Date(`${iso}T00:00:00`);
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

  const centerLabel =
    viewMode === "day"
      ? format(selectedDate, "dd/MM/yyyy")
      : viewMode === "week"
        ? `${format(weekStart, "dd/MM")} – ${format(weekEnd, "dd/MM")}`
        : capitalizeFirst(
            format(monthCursor, "MMMM 'de' yyyy", { locale: ptBR })
          );

  const centerValue =
    viewMode === "day"
      ? format(selectedDate, "yyyy-MM-dd")
      : viewMode === "week"
        ? format(weekStart, "yyyy-MM-dd")
        : format(monthCursor, "yyyy-MM-dd");

  const centerWidth =
    viewMode === "day"
      ? "w-[128px]"
      : viewMode === "week"
        ? "w-[150px]"
        : "w-[180px]";

  const nav = (
    <div className="flex items-center justify-center gap-1.5">
      <Button
        variant="outline"
        size="icon"
        aria-label="Anterior"
        className="h-9 w-9 sm:h-8 sm:w-8"
        onClick={stepPrev}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className={centerWidth}>
        <DatePicker
          value={centerValue}
          onChange={jumpTo}
          label={centerLabel}
          className="justify-center"
        />
      </div>
      <Button
        variant="outline"
        size="icon"
        aria-label="Próximo"
        className="h-9 w-9 sm:h-8 sm:w-8"
        onClick={stepNext}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="flex w-full flex-col gap-2 md:w-auto">
      {/* Linha 1: troca de visão + navegação central (desktop) + Novo */}
      <div className="flex items-center gap-2">
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
        <div className="hidden md:flex flex-1 justify-center px-2">{nav}</div>
        <div className="grow md:hidden" />
        <Button size="sm" onClick={onNew}>
          <Plus className="mr-1.5 h-4 w-4" /> Novo
        </Button>
      </div>

      {/* Linha 2 (mobile): navegação — a fila do dia já troca de dia com 1 toque */}
      {viewMode !== "day" && <div className="md:hidden">{nav}</div>}

      {/* Linha 3: chips de profissional com cor (dia/semana, mobile + desktop) */}
      {viewMode !== "month" && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 pr-1">
            <button
              type="button"
              onClick={() => setFilterProfessional("all")}
              className={cn(
                chipBase,
                filterProfessional === "all" ? chipActive : chipIdle
              )}
            >
              Todos
            </button>
            {professionals?.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setFilterProfessional(String(p.id))}
                className={cn(
                  chipBase,
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
          <div className="grow" />
          <div className="hidden md:block">
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

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
