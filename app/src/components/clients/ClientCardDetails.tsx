import { isoToDateBR } from "@/lib/input-masks";

export type ClientForDetails = {
  id: number;
  name: string;
  phone: string;
  birthDate: string | null;
  notes: string | null;
  totalVisits: number;
  totalSpent: string;
  createdAt: Date | string;
};

function ageFromISO(iso: string): number | null {
  const birth = new Date(iso);
  if (isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate()))
    age--;
  return age >= 0 ? age : null;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-slate-400 uppercase">
        {label}
      </p>
      <p className="text-sm font-medium text-slate-800 break-all">{value}</p>
    </div>
  );
}

export default function ClientCardDetails({
  client,
}: {
  client: ClientForDetails;
}) {
  const age = client.birthDate ? ageFromISO(client.birthDate) : null;
  const createdIso =
    typeof client.createdAt === "string"
      ? client.createdAt
      : client.createdAt.toISOString();
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <Detail
        label="Nascimento"
        value={
          client.birthDate
            ? `${isoToDateBR(client.birthDate)}${age !== null ? ` · ${age} anos` : ""}`
            : "—"
        }
      />
      <Detail label="Visitas" value={String(client.totalVisits)} />
      <Detail label="Total gasto" value={`R$ ${client.totalSpent}`} />
      <Detail label="Cliente desde" value={isoToDateBR(createdIso)} />
      <div className="col-span-2">
        <Detail
          label="Observações / Alergias"
          value={client.notes?.trim() ? client.notes : "Nenhuma"}
        />
      </div>
    </div>
  );
}
