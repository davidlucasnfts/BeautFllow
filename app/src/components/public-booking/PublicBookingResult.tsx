import { Button } from "@/components/ui/button";
import { CalendarCheck } from "lucide-react";

export type BookResult = {
  salonName: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  clientName: string;
};

/** Confirmação exibida após o envio do agendamento */
export default function PublicBookingResult({
  result,
  primaryColor,
  onReset,
}: {
  result: BookResult;
  primaryColor: string;
  onReset: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8 text-center space-y-4">
        <div
          className="mx-auto h-14 w-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: primaryColor + "22" }}
        >
          <CalendarCheck
            className="h-7 w-7"
            style={{ color: primaryColor }}
          />
        </div>
        <h1 className="text-xl font-bold text-slate-800">
          Agendamento enviado!
        </h1>
        <p className="text-slate-500 text-sm">
          <strong>{result.salonName}</strong> vai confirmar seu horário pelo
          WhatsApp.
        </p>
        <div className="rounded-lg bg-slate-50 p-4 text-sm text-left space-y-2">
          <p>
            <strong>Serviço:</strong> {result.serviceName}
          </p>
          <p>
            <strong>Data:</strong> {result.date.split("-").reverse().join("/")}
          </p>
          <p>
            <strong>Horário:</strong> {result.startTime} às {result.endTime}
          </p>
          <p>
            <strong>Nome:</strong> {result.clientName}
          </p>
        </div>
        <Button variant="outline" className="w-full" onClick={onReset}>
          Fazer outro agendamento
        </Button>
      </div>
    </div>
  );
}
