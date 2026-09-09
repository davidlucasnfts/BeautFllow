import { Trash2 } from "lucide-react";
import { trpc } from "@/providers/trpc";
import ClientCardDetails from "./ClientCardDetails";
import ClientHistory from "./ClientHistory";

type Client = {
  id: number;
  name: string;
  phone: string;
  birthDate: string | null;
  notes: string | null;
  totalVisits: number;
  totalSpent: string;
};

/** Conteúdo da linha expandida: ficha do cliente + histórico + excluir */
export default function ClientExpandedSection({
  client,
  salonId,
  deleteLabel,
  onDelete,
}: {
  client: Client;
  salonId: number;
  deleteLabel: string;
  onDelete: () => void;
}) {
  const { data: history } = trpc.appointment.historyByClient.useQuery({
    salonId,
    clientId: client.id,
    limit: 5,
  });
  const lastVisit = history && history.length > 0 ? history[0].appointmentDate : null;

  return (
    <div className="border-l-2 border-primary px-4 pb-3 pt-1 space-y-3">
      <ClientCardDetails client={client} lastVisit={lastVisit} />
      <ClientHistory history={history} />
      <div className="flex justify-end">
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onDelete();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {deleteLabel}
        </button>
      </div>
    </div>
  );
}
