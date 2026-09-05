import {
  User,
  MessageCircle,
  Edit3,
  Trash2,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { isoToDateBR } from "@/lib/input-masks";

export type ClientForPreview = {
  id: number;
  name: string;
  phone: string;
  birthDate: string | null;
  notes: string | null;
  tags: string | null;
  segment: string;
  totalVisits: number;
  totalSpent: string;
  consentGiven: boolean;
};

interface ClientPreviewProps {
  client: ClientForPreview;
  segmentBadgeClass: string;
  segmentLabelText: string;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
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

export default function ClientPreview({
  client,
  segmentBadgeClass,
  segmentLabelText,
  onEdit,
  onDelete,
  onClose,
}: ClientPreviewProps) {
  const phoneDigits = client.phone.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/55${phoneDigits}`;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Header: avatar + título + badges + ações */}
        <div className="p-4 lg:p-6 border-b border-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {client.name}
                </h3>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Badge
                    variant="secondary"
                    className={segmentBadgeClass + " text-[10px]"}
                  >
                    {segmentLabelText}
                  </Badge>
                  {client.consentGiven && (
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-700 text-[10px]"
                    >
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      Autorizou os dados
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {/* Ações empilhadas, sólidas */}
            <div className="flex flex-col gap-2 shrink-0">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-green-600 text-white hover:bg-green-700"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp
              </a>
              <button
                type="button"
                onClick={onEdit}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Editar
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir
              </button>
            </div>
          </div>
        </div>

        {/* Grid de detalhes */}
        <div className="p-4 lg:p-6 grid grid-cols-2 lg:grid-cols-3 gap-4">
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
      </div>

      {/* Fechar centralizado */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200"
        >
          <ChevronDown className="w-3.5 h-3.5" />
          Fechar
        </button>
      </div>
    </div>
  );
}
