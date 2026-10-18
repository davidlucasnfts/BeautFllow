import { MapPin, Phone } from "lucide-react";

type SalonHeaderInfo = {
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  phone?: string | null;
};

/** Cabeçalho da página pública: nome, endereço, telefone e tema do salão */
export default function PublicBookingHeader({
  salon,
  primaryColor,
  showPhone = true,
  tagline,
}: {
  salon: SalonHeaderInfo;
  primaryColor: string;
  showPhone?: boolean;
  tagline?: string;
}) {
  return (
    <header className="text-center space-y-2">
      <h1
        className="text-2xl font-bold tracking-tight"
        style={{ color: primaryColor }}
      >
        {salon.name}
      </h1>
      {(salon.address || salon.city) && (
        <p className="text-sm text-slate-500 flex items-center justify-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {[salon.address, salon.city, salon.state]
            .filter(Boolean)
            .join(", ")}
        </p>
      )}
      {showPhone && salon.phone && (
        <p className="text-sm text-slate-500 flex items-center justify-center gap-1">
          <Phone className="h-3.5 w-3.5" /> {salon.phone}
        </p>
      )}
      {tagline && <p className="text-slate-600">{tagline}</p>}
    </header>
  );
}
