import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Sparkles, Edit3, Trash2 } from "lucide-react";
import ProfessionalExpandedSection, {
  type ProfessionalForDetails,
} from "./ProfessionalExpandedSection";

export type ProfessionalForCard = ProfessionalForDetails;

interface ProfessionalCardProps {
  professional: ProfessionalForCard;
  expanded: boolean;
  onToggle: (id: number) => void;
  onEdit: (professional: ProfessionalForCard) => void;
  onDelete: (professional: ProfessionalForCard) => void;
}

/** Card do profissional — bolinha da cor, ações visíveis e clique expande a ficha */
export default function ProfessionalCard({
  professional: p,
  expanded,
  onToggle,
  onEdit,
  onDelete,
}: ProfessionalCardProps) {
  return (
    <Card
      className={`h-full gap-1.5 py-2.5 ${
        expanded ? "bg-primary/5" : "hover:bg-blue-50/50"
      } transition-colors`}
    >
      <div className="cursor-pointer" onClick={() => onToggle(p.id)}>
        <CardHeader className="p-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: (p.color ?? "#10b981") + "20" }}
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: p.color ?? "#10b981" }}
              />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base truncate">{p.name}</CardTitle>
              <p className="text-xs text-muted-foreground">
                Comissão {p.commissionRate}%
              </p>
            </div>
          </div>
        </CardHeader>
      </div>
      <CardContent className="space-y-2 text-sm">
        {/* linha de ações ocupa a largura toda do card — não quebra em tela estreita */}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onEdit(p)}
            className="flex flex-1 items-center justify-center gap-1 px-1.5 py-1.5 text-[11px] font-medium rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <Edit3 className="h-3 w-3" />
            Editar
          </button>
          <button
            type="button"
            onClick={() => onDelete(p)}
            className="flex flex-1 items-center justify-center gap-1 px-1.5 py-1.5 text-[11px] font-medium rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            Excluir
          </button>
        </div>
        {p.email && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{p.email}</span>
          </div>
        )}
        {p.phone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span>{p.phone}</span>
          </div>
        )}
        {p.bio && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{p.bio}</span>
          </div>
        )}
        {!p.email && !p.phone && !p.bio && (
          <p className="text-xs text-muted-foreground">
            Clique no card para ver a ficha completa.
          </p>
        )}
      </CardContent>
      {expanded && <ProfessionalExpandedSection professional={p} onClose={() => onToggle(p.id)} />}
    </Card>
  );
}
