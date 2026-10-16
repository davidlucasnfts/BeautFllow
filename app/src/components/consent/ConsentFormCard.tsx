import {
  FileText,
  Edit3,
  Trash2,
  ChevronDown,
  EyeOff,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type ConsentFormItem = {
  id: number;
  title: string;
  content: string;
  isActive: boolean;
  signatureCount: number;
  /** Data já formatada no servidor (dd/mm/aaaa, fuso SP) */
  createdAt: string;
};

interface ConsentFormCardProps {
  form: ConsentFormItem;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  /** ativa/desativa (soft delete — preserva histórico e assinaturas) */
  onToggleActive: () => void;
  /** exclusão física só aparece para termo sem assinaturas */
  onDelete: () => void;
  isPendingActive: boolean;
}

/** Card de termo: clique expande mostrando o texto completo + ações */
export default function ConsentFormCard({
  form,
  expanded,
  onToggle,
  onEdit,
  onToggleActive,
  onDelete,
  isPendingActive,
}: ConsentFormCardProps) {
  return (
    <Card
      className={`min-w-0 w-full cursor-pointer gap-1.5 py-2.5 transition-colors ${
        expanded ? "bg-primary/5" : "hover:bg-blue-50/50"
      } ${form.isActive ? "" : "opacity-60"}`}
      onClick={onToggle}
    >
      <CardHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-amber-100 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-amber-600" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base truncate">{form.title}</CardTitle>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <p className="text-xs text-muted-foreground">
                Criado em {form.createdAt}
              </p>
              {!form.isActive && (
                <Badge
                  variant="secondary"
                  className="bg-slate-100 text-slate-600 text-[10px]"
                >
                  Inativo
                </Badge>
              )}
              <Badge
                variant="secondary"
                className={`text-[10px] ${
                  form.signatureCount > 0
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {form.signatureCount}{" "}
                {form.signatureCount === 1 ? "assinatura" : "assinaturas"}
              </Badge>
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </CardHeader>
      {expanded ? (
        <CardContent className="px-4 pb-3 pt-1">
          <div className="rounded-lg border border-primary/40 p-3">
            <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">
              {form.content}
            </p>
          </div>
          <div className="flex flex-col items-stretch sm:items-end gap-1 mt-4">
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onEdit();
              }}
              className="flex items-center justify-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md border transition-colors border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Editar
            </button>
            {form.isActive ? (
              <button
                type="button"
                disabled={isPendingActive}
                onClick={e => {
                  e.stopPropagation();
                  onToggleActive();
                }}
                className="flex items-center justify-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md border transition-colors border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
              >
                <EyeOff className="h-3.5 w-3.5" />
                Desativar
              </button>
            ) : (
              <button
                type="button"
                disabled={isPendingActive}
                onClick={e => {
                  e.stopPropagation();
                  onToggleActive();
                }}
                className="flex items-center justify-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md border transition-colors border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
              >
                <Eye className="h-3.5 w-3.5" />
                Reativar
              </button>
            )}
            {!form.isActive && form.signatureCount === 0 && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="flex items-center justify-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md border transition-colors border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Excluir
              </button>
            )}
          </div>
          <div className="flex justify-center mt-4">
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onToggle();
              }}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-slate-100 transition-colors"
            >
              <ChevronDown className="h-3.5 w-3.5" />
              Fechar
            </button>
          </div>
        </CardContent>
      ) : (
        <CardContent className="px-4">
          <p className="text-sm text-muted-foreground line-clamp-3 break-words">
            {form.content}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
