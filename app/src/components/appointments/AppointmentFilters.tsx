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
} from "lucide-react";
import {
  format,
  addDays,
  addMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useIsMobile } from "@/hooks/use-mobile";
import DatePicker from "@/components/DatePicker";
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
  const isMobile = useIsMobile();
  const today = new Date();
  const weekStart = startOfWeek(addDays(today, weekOffset * 7), {
    weekStartsOn: 1,
  });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const monthCursor = addMonths(today, monthOffset);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* filtros avançados só no desktop — no mobile a fila tem troca de dia própria */}
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

      {viewMode === "week" && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekOffset(o => o - 1)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Anterior
          </Button>
          <span className="text-sm font-medium min-w-[140px] text-center">
            {format(weekStart, "dd/MM")} - {format(weekEnd, "dd/MM")}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekOffset(o => o + 1)}
          >
            Próxima
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </>
      )}

      {viewMode === "day" && !isMobile && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(d => addDays(d, -1))}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Anterior
          </Button>
          <div className="w-44">
            <DatePicker
              value={format(selectedDate, "yyyy-MM-dd")}
              onChange={iso =>
                setSelectedDate(() => new Date(`${iso}T00:00:00`))
              }
              placeholder="Escolha o dia"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(d => addDays(d, 1))}
          >
            Próxima
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </>
      )}

      {viewMode === "month" && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMonthOffset(o => o - 1)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Anterior
          </Button>
          <span className="text-sm font-medium min-w-[140px] text-center">
            {format(monthCursor, "MMMM 'de' yyyy", { locale: ptBR }).replace(
              /^./,
              c => c.toUpperCase()
            )}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMonthOffset(o => o + 1)}
          >
            Próxima
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </>
      )}
    </div>
  );
}
