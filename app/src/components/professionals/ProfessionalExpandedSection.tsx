import type { ReactNode } from "react";
import { Mail, Phone, Percent, Sparkles, Clock, ChevronDown } from "lucide-react";

export type ProfessionalForDetails = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  bio: string | null;
  color: string | null;
  commissionRate: string | null;
  workingHours: string | null;
};

interface ProfessionalExpandedSectionProps {
  professional: ProfessionalForDetails;
  onClose: () => void;
}

function DetailCell({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase">
        {icon}
        {label}
      </p>
      <p className="text-sm font-medium text-slate-800 break-words">{value}</p>
    </div>
  );
}

/** Ficha do profissional expandida dentro do card (padrão de preview/detalhes) */
export default function ProfessionalExpandedSection({
  professional: p,
  onClose,
}: ProfessionalExpandedSectionProps) {
  const cells = [
    {
      key: "email",
      icon: <Mail className="h-3 w-3" />,
      label: "E-mail",
      value: p.email,
    },
    {
      key: "phone",
      icon: <Phone className="h-3 w-3" />,
      label: "Telefone",
      value: p.phone,
    },
    {
      key: "commission",
      icon: <Percent className="h-3 w-3" />,
      label: "Comissão",
      value: `${p.commissionRate}%`,
    },
    {
      key: "bio",
      icon: <Sparkles className="h-3 w-3" />,
      label: "Especialidades",
      value: p.bio,
    },
    {
      key: "workingHours",
      icon: <Clock className="h-3 w-3" />,
      label: "Horários",
      value: p.workingHours,
    },
  ];

  return (
    <div
      className="border-t border-slate-100 px-4 pb-3 pt-3 space-y-3"
      onClick={e => e.stopPropagation()}
    >
      <div className="grid grid-cols-2 gap-4">
        {cells.map(cell => (
          <DetailCell
            key={cell.key}
            icon={cell.icon}
            label={cell.label}
            value={cell.value && cell.value.trim() ? cell.value : "—"}
          />
        ))}
      </div>
      <div className="flex justify-center pt-1">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
        >
          <ChevronDown className="h-3.5 w-3.5" />
          Fechar
        </button>
      </div>
    </div>
  );
}
