import { FileText, ShieldCheck } from "lucide-react";
import {
  CONSENT_TEMPLATES,
  type ConsentTemplate,
} from "./consent-templates";

/** Estado vazio: atalhos que criam um termo completo a partir de um modelo */
export default function ConsentEmptyState({
  onPick,
}: {
  onPick: (tpl: ConsentTemplate) => void;
}) {
  return (
    <div className="text-center py-12 text-muted-foreground border rounded-lg space-y-4">
      <ShieldCheck className="h-10 w-10 mx-auto opacity-20" />
      <div className="space-y-1">
        <p>Nenhum termo cadastrado.</p>
        <p className="text-sm">
          Comece com um dos modelos prontos — um clique já cria o termo
          completo:
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 max-w-xl mx-auto px-4 text-left">
        {CONSENT_TEMPLATES.map(tpl => (
          <button
            key={tpl.id}
            type="button"
            onClick={() => onPick(tpl)}
            className="flex items-start gap-2 rounded-md border border-slate-200 bg-white p-3 transition-colors hover:bg-slate-50"
          >
            <FileText className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-slate-800 break-words">
                {tpl.label}
              </span>
              <span className="block text-xs text-muted-foreground">
                {tpl.hint}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
