import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { isoToDateBR } from "@/lib/input-masks";

interface DatePickerProps {
  /** Data em ISO (yyyy-mm-dd) ou "" */
  value: string;
  onChange: (iso: string) => void;
  /** Chamado quando o mês visualizado do calendário muda (dropdown de mês/ano
   *  ou setas) — sem precisar clicar num dia. Útil em filtros por mês, onde a
   *  troca de mês já deve aplicar. Ao clicar num dia, onChange dispara junto. */
  onMonthChange?: (iso: string) => void;
  /** Não destaca nenhum dia como "selecionado" — para filtros por mês, onde o
   *  value é só o 1º do mês (pra posicionar o calendário) e pintar o dia 1
   *  junto com o "hoje" confunde. O dia de hoje continua com o estilo padrão. */
  hideSelectedDay?: boolean;
  placeholder?: string;
  /** Quando informado, exibe esse rótulo (com ChevronDown) no lugar da data —
   * ex.: "Setembro de 2026" ou "14 – 20 set." (padrão Google Calendar) */
  label?: string;
  disabled?: boolean;
  fromDate?: Date;
  toDate?: Date;
  /** Data mínima selecionável — dias anteriores ficam desabilitados no
   *  calendário (ex.: impede escolher datas passadas). */
  minDate?: Date;
  className?: string;
}

/** Seletor de data visual (Popover + Calendar) — estado interno segue ISO */
export default function DatePicker({
  value,
  onChange,
  onMonthChange,
  hideSelectedDay = false,
  placeholder = "Selecione",
  label,
  disabled,
  fromDate,
  toDate,
  minDate,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(`${value}T00:00:00`) : undefined;

  // Range de navegação: o que o uso definiu ou um padrão amplo (80 anos p/ trás,
  // 5 p/ frente) — sem isso o dropdown de ano só mostra o ano corrente
  const currentYear = new Date().getFullYear();
  const start = fromDate ?? new Date(currentYear - 80, 0, 1);
  const end = toDate ?? new Date(currentYear + 5, 11, 1);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start gap-2 font-normal",
            !value && !label && "text-muted-foreground",
            className
          )}
        >
          {label ? (
            <>
              <span className="truncate">{label}</span>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </>
          ) : (
            <>
              <CalendarIcon className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {value ? isoToDateBR(value) : placeholder}
              </span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={hideSelectedDay ? undefined : selected}
          onSelect={day => {
            if (day) {
              onChange(format(day, "yyyy-MM-dd"));
              setOpen(false);
            }
          }}
          onMonthChange={monthDate => {
            onMonthChange?.(format(monthDate, "yyyy-MM-dd"));
            // em filtros por mês, trocar o mês já é a ação — fecha o popup
            // pra mostrar a lista atualizada (sem isso o usuário precisa
            // clicar num dia só pra fechar)
            if (onMonthChange) setOpen(false);
          }}
          locale={ptBR}
          captionLayout="dropdown"
          fromDate={start}
          toDate={end}
          disabled={minDate ? { before: minDate } : undefined}
          formatters={{
            formatMonthDropdown: date =>
              date.toLocaleString("pt-BR", { month: "short" }),
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
