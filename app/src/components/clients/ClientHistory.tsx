import { isoToDateBR } from "@/lib/input-masks";

export type ClientHistoryItem = {
  id: number;
  appointmentDate: string;
  serviceName: string;
  servicePrice: string;
};

/** Histórico recente de atendimentos concluídos (data · serviço ... valor) */
export default function ClientHistory({
  history,
}: {
  history: ClientHistoryItem[] | undefined;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-slate-400 uppercase">
        Histórico recente
      </p>
      {history && history.length > 0 ? (
        <ul className="mt-1 divide-y">
          {history.map(h => (
            <li
              key={h.id}
              className="flex items-center justify-between gap-2 py-1.5 text-sm"
            >
              <span className="min-w-0 truncate text-slate-700">
                <span className="font-medium">
                  {isoToDateBR(h.appointmentDate).slice(0, 5)}
                </span>
                <span className="text-slate-400"> · </span>
                {h.serviceName}
              </span>
              <span className="shrink-0 font-medium text-slate-800">
                R$ {h.servicePrice}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground">
          Nenhum atendimento concluído ainda.
        </p>
      )}
    </div>
  );
}
