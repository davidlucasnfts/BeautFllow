import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserPlus,
  Trash2,
  XCircle,
  Copy,
  Check,
  UsersRound,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import {
  PLAN_USER_LIMITS,
  PLAN_LABELS,
  type Plan,
} from "@contracts/constants";
import {
  SALON_ROLE_LABELS,
  INVITABLE_ROLES,
  type SalonRole,
} from "@contracts/permissions";

export default function Team() {
  const { salon } = useSalon();
  const utils = trpc.useUtils();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Exclude<SalonRole, "owner">>("professional");
  const [manualLink, setManualLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{
    membershipId: number;
    name: string;
  } | null>(null);
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);

  const { data, isLoading } = trpc.team.list.useQuery(
    { salonId: salon?.id ?? 0 },
    { enabled: !!salon }
  );

  const plan = (salon?.plan ?? "free") as Plan;
  const limit = PLAN_USER_LIMITS[plan] ?? 1;
  const used = data?.members.filter(m => m.isActive).length ?? 0;
  const limitLabel = Number.isFinite(limit)
    ? `${used} de ${limit} ${limit === 1 ? "acesso usado" : "acessos usados"}`
    : `${used} acessos (plano ilimitado)`;

  const invalidate = () => utils.team.list.invalidate();

  const inviteMutation = trpc.team.invite.useMutation({
    onSuccess: result => {
      invalidate();
      if (result.link) {
        // Sem e-mail configurado: mostra o link para cópia manual
        setManualLink(result.link);
      } else {
        toast.success("Convite enviado por e-mail!");
        setInviteOpen(false);
        setEmail("");
        setManualLink(null);
      }
    },
    onError: e => toast.error(e.message),
  });

  const cancelMutation = trpc.team.cancelInvite.useMutation({
    onSuccess: () => {
      invalidate();
      toast.success("Convite cancelado.");
    },
    onError: e => toast.error(e.message),
  });

  const removeMutation = trpc.team.removeMember.useMutation({
    onSuccess: () => {
      invalidate();
      toast.success("Acesso removido.");
    },
    onError: e => toast.error(e.message),
  });

  function handleInvite() {
    if (!salon) return;
    inviteMutation.mutate({ salonId: salon.id, email, role });
  }

  async function copyLink() {
    if (!manualLink) return;
    await navigator.clipboard.writeText(manualLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const pendingInvites = data?.invites ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Equipe</h1>
          <p className="text-muted-foreground">
            Quem tem acesso ao seu StudioFlow —{" "}
            <span className="font-medium">
              {limitLabel} · Plano {PLAN_LABELS[plan]}
            </span>
          </p>
        </div>
        <Button
          onClick={() => {
            setManualLink(null);
            setInviteOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4" />
          Convidar
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UsersRound className="h-4 w-4 text-slate-500" />
            Membros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading && (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          )}
          {data?.members.map(member => (
            <div
              key={member.membershipId}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-slate-200 p-3"
            >
              <div className="min-w-0 basis-44 flex-1">
                <p className="text-sm font-medium text-slate-800 break-words">
                  {member.name ?? "Sem nome"}
                </p>
                <p className="text-xs text-muted-foreground break-all">
                  {member.email}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 flex-wrap justify-end">
                <Badge variant="secondary">
                  {SALON_ROLE_LABELS[member.role]}
                </Badge>
                {member.isActive ? (
                  <Badge className="bg-green-50 text-green-700 border border-green-200 hover:bg-green-50">
                    Ativo
                  </Badge>
                ) : (
                  <Badge className="bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-50">
                    Inativo
                  </Badge>
                )}
                {member.role !== "owner" && member.isActive && (
                  <button
                    onClick={() =>
                      setRemoveTarget({
                        membershipId: member.membershipId,
                        name: member.name ?? member.email,
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-100"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remover
                  </button>
                )}
              </div>
            </div>
          ))}
          {data && data.members.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum membro na equipe ainda.
            </p>
          )}
        </CardContent>
      </Card>

      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-500" />
              Convites pendentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingInvites.map(invite => (
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
                <button
                  onClick={() => setCancelTarget(invite.id)}
                  className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-100"
                >
                  <XCircle className="h-3 w-3" />
                  Cancelar convite
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Dialog de convite */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-h-[85vh] flex flex-col w-full max-w-lg">
          <DialogHeader className="shrink-0">
            <DialogTitle>Convidar para a equipe</DialogTitle>
            <DialogDescription>
              A pessoa recebe um e-mail para criar a senha e entrar.{" "}
              <span className="font-medium text-foreground">
                {limitLabel}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto min-h-0 py-2">
            <div className="space-y-2">
              <Label htmlFor="invite-email">E-mail</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="pessoa@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Papel</Label>
              <Select
                value={role}
                onValueChange={v => setRole(v as Exclude<SalonRole, "owner">)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha o papel" className="truncate" />
                </SelectTrigger>
                <SelectContent>
                  {INVITABLE_ROLES.map(r => (
                    <SelectItem key={r} value={r}>
                      {SALON_ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Profissional: agenda. Recepcionista: agenda, clientes e
                mensagens. Administrador: tudo, exceto configurações.
              </p>
            </div>

            {manualLink && (
              <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs text-amber-800">
                  O e-mail não foi enviado (serviço não configurado). Copie o
                  link e envie por WhatsApp ou outro canal:
                </p>
                <div className="flex gap-2">
                  <Input readOnly value={manualLink} className="bg-white text-xs" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={copyLink}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    Copiar
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="shrink-0">
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Fechar
            </Button>
            {!manualLink && (
              <Button
                onClick={handleInvite}
                disabled={inviteMutation.isPending || !email}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4" />
                {inviteMutation.isPending ? "Enviando..." : "Enviar convite"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de remoção */}
      <AlertDialog
        open={!!removeTarget}
        onOpenChange={open => !open && setRemoveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remover {removeTarget?.name} da equipe?
            </AlertDialogTitle>
            <AlertDialogDescription>
              O acesso da pessoa ao seu StudioFlow fica inativo. Os
              agendamentos e o histórico dela continuam salvos. Essa ação pode
              ser desfeita convidando-a novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (salon && removeTarget) {
                  removeMutation.mutate({
                    salonId: salon.id,
                    membershipId: removeTarget.membershipId,
                  });
                }
                setRemoveTarget(null);
              }}
            >
              Remover acesso
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                if (salon && cancelTarget !== null) {
                  cancelMutation.mutate({
                    salonId: salon.id,
                    inviteId: cancelTarget,
                  });
                }
                setCancelTarget(null);
              }}
            >
              Cancelar convite
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
