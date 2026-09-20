import { Link2, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function PublicLinkBanner({ slug }: { slug: string }) {
  const url = `${window.location.origin}/agendar/${slug}`;
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg border border-primary/20 bg-primary/10">
      <Link2 className="h-5 w-5 shrink-0 text-primary" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">
          Seu link de agendamento online
        </p>
        <p className="text-xs text-muted-foreground truncate">{url}</p>
      </div>
      {/* botoes agrupados: quando nao cabem, descem juntos (e nao um a um) */}
      <div className="ml-auto flex shrink-0 gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            navigator.clipboard.writeText(url);
            toast.success("Link copiado! Envie para seus clientes.");
          }}
        >
          <Copy className="mr-2 h-3.5 w-3.5" /> Copiar link
        </Button>
        <Button
          size="sm"
          className="bg-green-600 text-white hover:bg-green-700"
          onClick={() => {
            const text = encodeURIComponent(
              `Olá! Agende seu horário com a gente aqui: ${url}`
            );
            window.open(`https://wa.me/?text=${text}`, "_blank");
          }}
        >
          <MessageCircle className="mr-2 h-3.5 w-3.5" /> WhatsApp
        </Button>
      </div>
    </div>
  );
}
