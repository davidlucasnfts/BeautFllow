import { useState } from "react";
import { format } from "date-fns";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/salon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { ShieldCheck, FileText, Plus, CheckCircle2, AlertTriangle, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";


export default function Consent() {
  const { salon } = useSalon();
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });

  const utils = trpc.useUtils();
  const { data: forms, isLoading } = trpc.consent.list.useQuery(
    { salonId: salon?.id ?? 0 },
    { enabled: !!salon }
  );

  const createMutation = trpc.consent.create.useMutation({
    onSuccess: () => {
      utils.consent.list.invalidate();
      setOpenForm(false);
      setForm({ title: "", content: "" });
      toast.success("Termo criado");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Termos & LGPD</h1>
          <p className="text-muted-foreground">Consentimentos digitais, auditoria e compliance</p>
        </div>
        <Dialog open={openForm} onOpenChange={setOpenForm}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Novo Termo</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Novo Termo de Consentimento</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Título *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Termo de Depilação a Laser" />
              </div>
              <div className="grid gap-2">
                <Label>Conteúdo do Termo *</Label>
                <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} placeholder="Descreva os riscos, cuidados e autorizações..." />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
              <Button onClick={() => salon && createMutation.mutate({ salonId: salon.id, ...form })} disabled={createMutation.isPending}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-4">
        <Card className="p-4 border-emerald-200 bg-emerald-50/30">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-emerald-800">LGPD Compliance</p>
              <p className="text-xs text-emerald-700 mt-1">Coleta mínima, consentimento explícito, direito à exclusão e auditoria completa.</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-amber-200 bg-amber-50/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Termos Digitais</p>
              <p className="text-xs text-amber-700 mt-1">Assinatura digital com IP, user-agent e timestamp. Legalmente válido para procedimentos estéticos.</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-blue-200 bg-blue-50/30">
          <div className="flex items-start gap-3">
            <Download className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Exportação de Dados</p>
              <p className="text-xs text-blue-700 mt-1">Cliente pode solicitar exportação completa de seus dados em formato legível.</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Termos de Consentimento Ativos</h2>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : forms && forms.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {forms.map((f) => (
              <Card key={f.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-amber-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{f.title}</CardTitle>
                      <p className="text-xs text-muted-foreground">{format(new Date(f.createdAt), "dd/MM/yyyy")}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">{f.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground border rounded-lg">
            <ShieldCheck className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p>Nenhum termo cadastrado.</p>
            <p className="text-sm">Crie termos de consentimento para procedimentos que exigem autorização.</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Checklist LGPD</h2>
        <div className="grid gap-3">
          {[
            { label: "Coleta mínima de dados (nome, telefone, e-mail opcional)", done: true },
            { label: "Consentimento explícito no primeiro cadastro", done: true },
            { label: "Direito à exclusão com anonimização", done: true },
            { label: "Auditoria de acessos (audit_logs)", done: true },
            { label: "Termos de consentimento digital assinados", done: true },
            { label: "Criptografia em trânsito e repouso", done: true },
            { label: "RBAC por salão (owner, admin, profissional, recepcionista)", done: true },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 border rounded-md bg-background">
              <div className={`h-5 w-5 rounded-full flex items-center justify-center ${item.done ? "bg-emerald-100" : "bg-slate-100"}`}>
                <CheckCircle2 className={`h-3.5 w-3.5 ${item.done ? "text-emerald-600" : "text-slate-400"}`} />
              </div>
              <span className={`text-sm ${item.done ? "" : "text-muted-foreground"}`}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
