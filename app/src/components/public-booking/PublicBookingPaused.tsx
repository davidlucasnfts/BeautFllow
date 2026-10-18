import { Button } from "@/components/ui/button";
import { Clock, Phone } from "lucide-react";
import PublicBookingHeader from "./PublicBookingHeader";

type PausedSalonInfo = {
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  phone?: string | null;
};

/** Tela exibida quando o dono pausa o agendamento online (férias/reforma):
 *  o link continua ativo, mas ninguém consegue agendar */
export default function PublicBookingPaused({
  salon,
  primaryColor,
}: {
  salon: PausedSalonInfo;
  primaryColor: string;
}) {
  const waPhone = salon.phone?.replace(/\D/g, "");
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="mx-auto max-w-md space-y-6">
        <PublicBookingHeader salon={salon} primaryColor={primaryColor} />
        <div className="bg-white rounded-2xl shadow-sm border p-8 text-center space-y-4">
          <div
            className="mx-auto h-14 w-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: primaryColor + "22" }}
          >
            <Clock className="h-7 w-7" style={{ color: primaryColor }} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            Agendamento online temporariamente pausado
          </h2>
          <p className="text-slate-500 text-sm">
            Estamos em férias ou reforma. Para marcar seu horário, fale com a
            gente pelo WhatsApp.
          </p>
          {waPhone && (
            <Button
              className="w-full text-white gap-2"
              style={{ backgroundColor: primaryColor }}
              asChild
            >
              <a
                href={`https://wa.me/55${waPhone}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Phone className="h-4 w-4" />
                Chamar no WhatsApp
              </a>
            </Button>
          )}
          {salon.phone && (
            <p className="text-sm text-slate-500">{salon.phone}</p>
          )}
        </div>
        <footer className="text-center text-xs text-slate-400">
          Agendamento online por StudioFlow
        </footer>
      </div>
    </div>
  );
}
