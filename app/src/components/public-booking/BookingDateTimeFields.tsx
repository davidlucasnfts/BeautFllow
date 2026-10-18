import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import DatePicker from "@/components/DatePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BookingDateTimeFieldsProps {
  date: string;
  onDateChange: (iso: string) => void;
  effectiveStartTime: string;
  onStartTimeChange: (slot: string) => void;
  hasService: boolean;
  isFetchingSlots: boolean;
  slots: string[];
  closedDay: boolean;
  maxBookingDate: Date;
}

/** Campos de data e horário da página pública, com aviso de dia fechado */
export default function BookingDateTimeFields({
  date,
  onDateChange,
  effectiveStartTime,
  onStartTimeChange,
  hasService,
  isFetchingSlots,
  slots,
  closedDay,
  maxBookingDate,
}: BookingDateTimeFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Data *</Label>
          <DatePicker
            value={date}
            onChange={onDateChange}
            placeholder="Escolha a data"
            fromDate={new Date()}
            minDate={new Date()}
            toDate={maxBookingDate}
          />
        </div>
        <div className="grid gap-2">
          <Label>Horário *</Label>
          <Select
            value={effectiveStartTime}
            onValueChange={onStartTimeChange}
            disabled={!hasService || !date}
          >
            <SelectTrigger>
              <SelectValue
                className="truncate"
                placeholder={
                  !hasService
                    ? "Escolha o serviço"
                    : !date
                      ? "Informe a data"
                      : isFetchingSlots
                        ? "Carregando..."
                        : slots.length === 0
                          ? "Sem horários"
                          : "Selecione"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {slots.map(slot => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {closedDay && (
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <Clock className="h-4 w-4 shrink-0 mt-0.5" />
          <p>Não atendemos neste dia. Escolha outra data.</p>
        </div>
      )}
    </>
  );
}
