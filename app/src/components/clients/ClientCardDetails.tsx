import { isoToDateBR } from "@/lib/input-masks";

export type ClientForDetails = {
  id: number;
  name: string;
  phone: string;
  birthDate: string | null;
  notes: string | null;
  totalVisits: number;
  totalSpent: string;
};

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
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <Detail label="Telefone" value={client.phone} />
      <Detail
        label="Nascimento"
        value={client.birthDate ? isoToDateBR(client.birthDate) : "—"}
      />
      <Detail label="Visitas" value={String(client.totalVisits)} />
      <Detail label="Total gasto" value={`R$ ${client.totalSpent}`} />
      <div className="col-span-2">
        <Detail
          label="Observações / Alergias"
          value={client.notes?.trim() ? client.notes : "Nenhuma"}
        />
      </div>
    </div>
  );
}
