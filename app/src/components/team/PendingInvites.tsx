import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Link2, Mail, Send, XCircle } from "lucide-react";
import { toast } from "sonner";
import { SALON_ROLE_LABELS, type SalonRole } from "@contracts/permissions";

interface PendingInvite {
  id: number;
  email: string;
  role: SalonRole;
  expiresAt: Date | string;
  token: string;
}

interface PendingInvitesProps {
  salonId: number;
  invites: PendingInvite[];
  /** Sem e-mail configurado: reabre a caixa âmbar com o link (mesma do convite) */
  onManualLink: (link: string) => void;
}

export default function PendingInvites({
  salonId,
  invites,
  onManualLink,
}: PendingInvitesProps) {
  const utils = trpc.useUtils();
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);
  const [resentEmail, setResentEmail] = useState("");

  const cancelMutation = trpc.team.cancelInvite.useMutation({
    onSuccess: () => {
      utils.team.list.invalidate();
      toast.success("Convite cancelado.");
    },
    onError: e => toast.error(e.message),
  });

  const resendMutation = trpc.team.resend.useMutation({
    onSuccess: result => {
      if (result.link) {
        // Sem e-mail configurado: reabre a caixinha âmbar com o link
        onManualLink(result.link);
      } else {
        toast.success(`Convite reenviado para ${resentEmail}`);
      }
    },
    onError: e => toast.error(e.message),
  });

  function handleResend(invite: PendingInvite) {
    setResentEmail(invite.email);
    resendMutation.mutate({ salonId, inviteId: invite.id });
  }

  async function handleCopyLink(invite: PendingInvite) {
    const link = `${window.location.origin}/convite?token=${invite.token}`;
    await navigator.clipboard.writeText(link);
    toast.success("Link copiado");
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="h-4 w-4 text-slate-500" />
          Convites pendentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {invites.map(invite => (
          <div
            key={invite.id}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-slate-200 p-3"
          >
            <div className="min-w-0 basis-44 flex-1">
              <p className="text-sm font-medium text-slate-800 break-all">
                {invite.email}
              </p>
              <p className="text-xs text-muted-foreground">
                como {SALON_ROLE_LABELS[invite.role]} · expira em{" "}
                {new Date(invite.expiresAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <Badge className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50">
              Pendente
            </Badge>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => handleResend(invite)}
                disabled={resendMutation.isPending}
                className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
              >
                <Send className="h-3 w-3" />
                Reenviar
              </button>
              <button
                onClick={() => handleCopyLink(invite)}
                className="inline-flex items-center gap-1 rounded-md border border-purple-200 bg-purple-50 px-2 py-1 text-[11px] font-medium text-purple-700 hover:bg-purple-100"
              >
                <Link2 className="h-3 w-3" />
                Copiar link
              </button>
              <button
                onClick={() => setCancelTarget(invite.id)}
                className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-100"
              >
                <XCircle className="h-3 w-3" />
                Cancelar
              </button>
            </div>
          </div>
        ))}
      </CardContent>

      {/* Confirmação de cancelamento de convite */}
      <AlertDialog
        open={cancelTarget !== null}
        onOpenChange={open => !open && setCancelTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar este convite?</AlertDialogTitle>
            <AlertDialogDescription>
              O link enviado para de funcionar imediatamente. Se precisar,
              você pode convidar a pessoa de novo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (cancelTarget !== null) {
                  cancelMutation.mutate({ salonId, inviteId: cancelTarget });
                }
                setCancelTarget(null);
              }}
            >
              Cancelar convite
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
