import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Phone, Mail, CheckCircle2, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const channelIcons: Record<string, typeof MessageSquare> = {
  whatsapp: Phone,
  sms: MessageSquare,
  email: Mail,
  in_app: MessageSquare,
};

const typeLabels: Record<string, string> = {
  confirmation: "Confirmação",
  reminder: "Lembrete",
  check_in: "Check-in",
  post_care: "Pós-cuidado",
  reactivation: "Reativação",
  campaign: "Campanha",
  manual: "Manual",
};

const statusColors: Record<string, string> = {
  pending: "bg-slate-100 text-slate-600",
  sent: "bg-blue-100 text-blue-700",
  delivered: "bg-emerald-100 text-emerald-700",
  read: "bg-violet-100 text-violet-700",
  failed: "bg-rose-100 text-rose-700",
};

export default function Communications() {
  const { salon } = useSalon();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    clientId: "",
    type: "manual" as const,
    channel: "whatsapp" as const,
    content: "",
  });

  const utils = trpc.useUtils();
  const { data: comms, isLoading } = trpc.communication.listBySalon.useQuery(
    { salonId: salon?.id ?? 0 },
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
      toast.success("Mensagem enviada");
    },
    onError: (e) => toast.error(e.message),
  });

  function handleSubmit() {
    if (!salon) return;
    createMutation.mutate({
      salonId: salon.id,
      clientId: Number(form.clientId),
      type: form.type,
      channel: form.channel,
      content: form.content,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Comunicação</h1>
          <p className="text-muted-foreground">Central de mensagens e histórico omnichannel</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Send className="mr-2 h-4 w-4" /> Enviar Mensagem</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nova Mensagem</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Cliente</Label>
                <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{clients?.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Canal</Label>
                  <Select value={form.channel} onValueChange={(v: typeof form.channel) => setForm({ ...form, channel: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Tipo</Label>
                  <Select value={form.type} onValueChange={(v: typeof form.type) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmation">Confirmação</SelectItem>
                      <SelectItem value="reminder">Lembrete</SelectItem>
                      <SelectItem value="post_care">Pós-cuidado</SelectItem>
                      <SelectItem value="reactivation">Reativação</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Mensagem</Label>
                <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
              <Button onClick={handleSubmit} disabled={createMutation.isPending}>Enviar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>Templates automáticos: confirmação, lembrete, check-in, pós-cuidado</span>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span>Clientes em risco de churn recebem mensagem de reativação automaticamente</span>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>WhatsApp Business API integrado com rastreamento de entrega</span>
          </div>
        </Card>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : comms && comms.length > 0 ? (
        <div className="space-y-3">
          {comms.map((c) => {
            const Icon = channelIcons[c.channel] ?? MessageSquare;
            return (
              <Card key={c.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{clients?.find((cl) => cl.id === c.clientId)?.name ?? "Cliente"}</span>
                        <Badge variant="secondary" className={statusColors[c.status] + " text-[10px]"}>
                          {c.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {c.createdAt ? format(new Date(c.createdAt), "dd/MM HH:mm", { locale: ptBR }) : ""}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{c.content}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="capitalize">{typeLabels[c.type] ?? c.type}</span>
                      <span>•</span>
                      <span className="capitalize">{c.channel}</span>
                      <span>•</span>
                      <span>{c.direction === "outbound" ? "Enviada" : "Recebida"}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Nenhuma comunicação registrada.</p>
        </div>
      )}
    </div>
  );
}
