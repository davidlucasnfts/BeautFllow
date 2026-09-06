import { Link2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function PublicLinkBanner({ slug }: { slug: string }) {
  const url = `${window.location.origin}/agendar/${slug}`;
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50">
      <Link2 className="h-5 w-5 shrink-0 text-blue-600" />
      <div className="flex-1">
        <p className="text-sm font-medium text-blue-900">
          Seu link de agendamento online
        </p>
        <p className="text-xs text-blue-700 break-all">{url}</p>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="bg-white"
        onClick={() => {
          navigator.clipboard.writeText(url);
          toast.success("Link copiado! Envie para seus clientes.");
        }}
      >
        <Copy className="mr-2 h-3.5 w-3.5" /> Copiar link
      </Button>
    </div>
  );
}
