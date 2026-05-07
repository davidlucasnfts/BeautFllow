import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, UserCircle, Phone, Mail, Percent, Edit3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function Professionals() {
  const { salon } = useSalon();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    commissionRate: "0",
    color: "#10b981",
    workingHours: "",
  });

  const utils = trpc.useUtils();
  const { data: professionals, isLoading } = trpc.professional.list.useQuery(
    { salonId: salon?.id ?? 0 },
    { enabled: !!salon }
  );

  const createMutation = trpc.professional.create.useMutation({
    onSuccess: () => {
      utils.professional.list.invalidate();
      setOpen(false);
      resetForm();
      toast.success("Profissional cadastrado");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.professional.update.useMutation({
    onSuccess: () => {
      utils.professional.list.invalidate();
      setOpen(false);
      setEditing(null);
      resetForm();
      toast.success("Profissional atualizado");
    },
    onError: (e) => toast.error(e.message),
  });

  function resetForm() {
    setForm({ name: "", email: "", phone: "", bio: "", commissionRate: "0", color: "#10b981", workingHours: "" });
  }

  function handleEdit(p: NonNullable<typeof professionals>[number]) {
    setEditing(p.id);
    setForm({
      name: p.name,
      email: p.email ?? "",
      phone: p.phone ?? "",
      bio: p.bio ?? "",
      commissionRate: String(p.commissionRate),
      color: p.color ?? "#10b981",
      workingHours: p.workingHours ?? "",
    });
    setOpen(true);
  }

  function handleSubmit() {
    if (!salon) return;
    if (editing) {
      updateMutation.mutate({ id: editing, salonId: salon.id, ...form });
    } else {
      createMutation.mutate({ salonId: salon.id, ...form });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profissionais</h1>
          <p className="text-muted-foreground">Equipe, comissões e horários</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); resetForm(); }}>
              <Plus className="mr-2 h-4 w-4" /> Novo Profissional
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar Profissional" : "Novo Profissional"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nome *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>E-mail</Label>
                  <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Telefone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Comissão (%)</Label>
                  <Input value={form.commissionRate} onChange={(e) => setForm({ ...form, commissionRate: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Cor do calendário</Label>
                  <div className="flex items-center gap-2">
                    <Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-12 h-10 p-1" />
                    <span className="text-sm text-muted-foreground">{form.color}</span>
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Biografia / Especialidades</Label>
                <Input value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
              <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36" />)}
        </div>
      ) : professionals && professionals.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {professionals.map((p) => (
            <Card key={p.id} className="group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: (p.color ?? "#10b981") + "20" }}>
                      <UserCircle className="h-6 w-6" style={{ color: p.color ?? undefined }} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{p.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">Comissão {p.commissionRate}%</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(p)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {p.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{p.email}</span>
                  </div>
                )}
                {p.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{p.phone}</span>
                  </div>
                )}
                {p.bio && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Percent className="h-3.5 w-3.5" />
                    <span className="truncate">{p.bio}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <UserCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Nenhum profissional cadastrado.</p>
        </div>
      )}
    </div>
  );
}
