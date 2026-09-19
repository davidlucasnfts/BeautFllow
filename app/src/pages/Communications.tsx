import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Send,
  Phone,
  Mail,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import MessageFormDialog, {
  type MessagePreset,
} from "@/components/communications/MessageFormDialog";

const channelIcons: Record<string, typeof MessageSquare> = {
  whatsapp: Phone,
  sms: MessageSquare,
  email: Mail,
  in_app: MessageSquare,
};

const typeLabels: Record<string, string> = {
  confirmation: "Confirmação",
  reminder: "Lembrete",
  check_in: "Chegada",
  post_care: "Pós-cuidado",
  reactivation: "Trazer de volta",
  campaign: "Campanha",
  manual: "Escrita por você",
};

const statusLabels: Record<string, string> = {
  pending: "Na fila",
  sent: "Enviada",
  delivered: "Chegou",
  read: "Lida",
  failed: "Não chegou",
};

const channelLabels: Record<string, string> = {
  whatsapp: "WhatsApp",
  sms: "SMS",
  email: "E-mail",
  in_app: "No aplicativo",
  phone: "Telefone",
};

const statusColors: Record<string, string> = {
  pending: "bg-slate-100 text-slate-600",
  sent: "bg-blue-100 text-blue-700",
  delivered: "bg-emerald-100 text-emerald-700",
  read: "bg-violet-100 text-violet-700",
  failed: "bg-rose-100 text-rose-700",
};

/** Quantidade de mensagens buscada por vez (botão "Carregar mais") */
const MESSAGE_PAGE_SIZE = 50;

export default function Communications() {
  const { salon } = useSalon();
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<MessagePreset | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [listLimit, setListLimit] = useState(MESSAGE_PAGE_SIZE);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    label: string;
  } | null>(null);

  const utils = trpc.useUtils();
  const {
    data: comms,
    isLoading,
    isError,
  } = trpc.communication.listBySalon.useQuery(
    { salonId: salon?.id ?? 0, limit: listLimit },
    { enabled: !!salon }
  );

  const { data: clients } = trpc.customer.list.useQuery(
    { salonId: salon?.id ?? 0 },
    { enabled: !!salon }
  );

  const createMutation = trpc.communication.create.useMutation({
    onSuccess: () => {
      utils.communication.listBySalon.invalidate();
      setOpen(false);
      setPreset(null);
      toast.success(preset ? "Mensagem reenviada" : "Mensagem enviada");
    },
    onError: e => toast.error(e.message),
  });

  const deleteMutation = trpc.communication.delete.useMutation({
    onSuccess: () => {
      utils.communication.listBySalon.invalidate();
      setSelectedId(null);
      setDeleteTarget(null);
      toast.success("Mensagem excluída");
    },
    onError: e => toast.error(e.message),
  });

  function clientName(clientId: number) {
    return clients?.find(cl => cl.id === clientId)?.name ?? "Cliente";
  }

  function handleSubmit(data: {
    clientId: number;
    channel: "whatsapp" | "sms" | "email" | "in_app";
    type:
      | "confirmation"
      | "reminder"
      | "check_in"
      | "post_care"
      | "reactivation"
      | "campaign"
      | "manual";
    content: string;
  }) {
    if (!salon) return;
    createMutation.mutate({ salonId: salon.id, ...data });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mensagens</h1>
          <p className="text-muted-foreground">
            Todas as mensagens enviadas para seus clientes
          </p>
        </div>
        <Button
          onClick={() => {
            setPreset(null);
            setOpen(true);
          }}
        >
          <Send className="mr-2 h-4 w-4" /> Enviar Mensagem
        </Button>
      </div>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <MessageSquare className="h-3.5 w-3.5 shrink-0" />
        Confirmações, lembretes e pós-cuidado saem sozinhas — aqui você
        acompanha tudo e pode reenviar.
      </p>

      {isLoading ? (
        <div className="rounded-xl border bg-card divide-y overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[76px] w-full rounded-none bg-muted" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-20 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Falha ao carregar. Atualize a página.</p>
        </div>
      ) : comms && comms.length > 0 ? (
        <div className="rounded-xl border bg-card divide-y overflow-hidden">
          {comms.map(c => {
            const Icon = channelIcons[c.channel] ?? MessageSquare;
            const expanded = selectedId === c.id;
            return (
              <div
                key={c.id}
                className={`cursor-pointer transition-colors ${
                  expanded ? "bg-primary/5" : "hover:bg-blue-50/50"
                }`}
                onClick={() => setSelectedId(expanded ? null : c.id)}
              >
                <div className="flex items-center gap-3 px-4 py-2.5">
                  {/* Coluna de ações na primeira posição */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setPreset({
                          clientId: c.clientId,
                          type: c.type,
                          channel: c.channel,
                          content: c.content,
                        });
                        setOpen(true);
                      }}
                      className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reenviar
                    </button>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setDeleteTarget({
                          id: c.id,
                          label: `${clientName(c.clientId)} — ${c.content.slice(0, 40)}${c.content.length > 40 ? "…" : ""}`,
                        });
                      }}
                      className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                      Excluir
                    </button>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {clientName(c.clientId)}
                      </span>
                      <Badge
                        variant="secondary"
                        className={statusColors[c.status] + " text-[10px]"}
                      >
                        {statusLabels[c.status] ?? c.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {c.content}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span className="capitalize">
                        {typeLabels[c.type] ?? c.type}
                      </span>
                      <span>•</span>
                      <span>{channelLabels[c.channel] ?? c.channel}</span>
                      <span>•</span>
                      <span>
                        {c.direction === "outbound" ? "Enviada" : "Recebida"}
                      </span>
                      <span>•</span>
                      {/* createdAt já vem formatado do servidor (fuso SP) */}
                      <span>{c.createdAt}</span>
                    </div>
                  </div>
                </div>
                {expanded && (
                  <div className="px-4 pb-4">
                    <div className="rounded-lg bg-muted/60 p-4">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">
                        Conteúdo da mensagem
                      </p>
                      <p className="text-sm text-slate-800 whitespace-pre-wrap break-words">
                        {c.content}
                      </p>
                    </div>
                    <div className="flex justify-center mt-3">
                      <button
                        type="button"
                        onClick={() => setSelectedId(null)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                      >
                        Fechar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Nenhuma mensagem enviada ainda.</p>
        </div>
      )}

      {!isLoading && !isError && comms && comms.length >= listLimit && (
        <div className="flex flex-col items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setListLimit(prev => prev + MESSAGE_PAGE_SIZE)}
          >
            Carregar mais mensagens
          </Button>
          <p className="text-xs text-muted-foreground">
            Exibindo as {listLimit} mensagens mais recentes
          </p>
        </div>
      )}

      <MessageFormDialog
        open={open}
        onOpenChange={v => {
          setOpen(v);
          if (!v) setPreset(null);
        }}
        clients={clients ?? []}
        preset={preset}
        isPending={createMutation.isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={o => !o && setDeleteTarget(null)}
        itemType="mensagem"
        itemName={deleteTarget?.label ?? ""}
        onConfirm={() => {
          if (salon && deleteTarget) {
            deleteMutation.mutate({
              id: deleteTarget.id,
              salonId: salon.id,
            });
          }
        }}
      />
    </div>
  );
}
