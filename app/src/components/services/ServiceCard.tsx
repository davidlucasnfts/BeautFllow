import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, DollarSign, Edit3, Copy, Trash2, ShieldCheck } from "lucide-react";
import { moneyDotToBR } from "@/lib/input-masks";

export type ServiceForCard = {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  durationMinutes: number;
  price: string;
  color: string | null;
  requiresConsent: boolean;
  preCareInstructions: string | null;
  postCareInstructions: string | null;
};

interface ServiceCardProps {
  service: ServiceForCard;
  onEdit: (service: ServiceForCard) => void;
  onDuplicate: (service: ServiceForCard) => void;
  onDelete: (service: ServiceForCard) => void;
}

/** Card do serviço no catálogo — ações empilhadas nas cores do design system */
export default function ServiceCard({
  service: s,
  onEdit,
  onDuplicate,
  onDelete,
}: ServiceCardProps) {
  return (
    <Card className="h-full gap-1.5 py-2.5">
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="h-10 w-10 rounded-md flex items-center justify-center shrink-0"
              style={{ backgroundColor: (s.color ?? "#6366f1") + "20" }}
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: s.color ?? "#6366f1" }}
              />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base truncate">{s.name}</CardTitle>
              {s.category && (
                <p className="text-xs text-muted-foreground truncate">
                  {s.category}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(s)}
              className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            >
              <Edit3 className="h-3 w-3" />
              Editar
            </button>
            <button
              type="button"
              onClick={() => onDuplicate(s)}
              className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
            >
              <Copy className="h-3 w-3" />
              Duplicar
            </button>
            <button
              type="button"
              onClick={() => onDelete(s)}
              className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Excluir
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{s.durationMinutes} min</span>
          </div>
          <div className="flex items-center gap-2 font-medium">
            <DollarSign className="h-3.5 w-3.5" />
            <span>R$ {moneyDotToBR(String(s.price))}</span>
          </div>
        </div>
        {s.requiresConsent && (
          <div className="flex items-center gap-2 text-amber-600 text-xs">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Precisa de autorização assinada</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
