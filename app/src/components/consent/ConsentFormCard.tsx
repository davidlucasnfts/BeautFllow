import { format } from "date-fns";
import { FileText, Edit3, Trash2, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type ConsentFormItem = {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
};

interface ConsentFormCardProps {
  form: ConsentFormItem;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/** Card de termo: clique expande mostrando o texto completo + ações */
export default function ConsentFormCard({
  form,
  expanded,
  onToggle,
  onEdit,
  onDelete,
}: ConsentFormCardProps) {
  return (
    <Card
      className={`h-full cursor-pointer gap-1.5 py-2.5 transition-colors ${
        expanded ? "bg-primary/5" : "hover:bg-blue-50/50"
      }`}
      onClick={onToggle}
    >
      <CardHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-amber-100 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-amber-600" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base truncate">{form.title}</CardTitle>
            <p className="text-xs text-muted-foreground">
              Criado em {format(new Date(form.createdAt), "dd/MM/yyyy")}
            </p>
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
          <p className="text-sm text-slate-700 whitespace-pre-wrap">
            {form.content}
          </p>
          <div className="flex flex-col items-stretch sm:items-end gap-1 mt-4">
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onEdit();
              }}
              className="flex items-center justify-center gap-1.5 px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Editar
            </button>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex items-center justify-center gap-1.5 px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Excluir
            </button>
          </div>
          <div className="flex justify-center mt-4">
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onToggle();
              }}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <ChevronDown className="h-3.5 w-3.5" />
              Fechar
            </button>
          </div>
        </CardContent>
      ) : (
        <CardContent className="px-4">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {form.content}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
