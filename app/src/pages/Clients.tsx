import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Phone, Mail, Calendar, User, Users, Trash2, Edit3, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const segmentColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  active: "bg-emerald-100 text-emerald-700",
  vip: "bg-amber-100 text-amber-700",
  at_risk: "bg-rose-100 text-rose-700",
  inactive: "bg-slate-100 text-slate-700",
};

const segmentLabels: Record<string, string> = {
  new: "Novo",
  active: "Ativo",
  vip: "VIP",
  at_risk: "Em Risco",
  inactive: "Inativo",
};

export default function Clients() {
  const { salon } = useSalon();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    birthDate: "",
    cpf: "",
    notes: "",
    tags: "",
  });

  const utils = trpc.useUtils();
  const { data: clients, isLoading } = trpc.customer.list.useQuery(
    { salonId: salon?.id ?? 0 },
    { enabled: !!salon }
  );

  const createMutation = trpc.customer.create.useMutation({
    onSuccess: () => {
      utils.customer.list.invalidate();
      setOpen(false);
      resetForm();
      toast.success("Cliente cadastrado com sucesso");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.customer.update.useMutation({
    onSuccess: () => {
      utils.customer.list.invalidate();
      setOpen(false);
      setEditing(null);
      resetForm();
      toast.success("Cliente atualizado");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.customer.delete.useMutation({
    onSuccess: () => {
      utils.customer.list.invalidate();
      toast.success("Cliente removido (LGPD)");
    },
    onError: (e) => toast.error(e.message),
  });

  const filtered = search
    ? clients?.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
      )
    : clients;

  function resetForm() {
    setForm({ name: "", phone: "", email: "", birthDate: "", cpf: "", notes: "", tags: "" });
  }

  function handleEdit(client: NonNullable<typeof clients>[number]) {
    setEditing(client.id);
    setForm({
      name: client.name,
      phone: client.phone,
      email: client.email ?? "",
      birthDate: client.birthDate ? new Date(client.birthDate).toISOString().split("T")[0] : "",
      cpf: client.cpf ?? "",
      notes: client.notes ?? "",
      tags: client.tags ?? "",
    });
    setOpen(true);
  }

  function handleSubmit() {
    if (!salon) return;
    if (editing) {
      updateMutation.mutate({
        id: editing,
        salonId: salon.id,
        ...form,
        email: form.email || undefined,
      });
    } else {
      createMutation.mutate({
        salonId: salon.id,
        ...form,
        email: form.email || undefined,
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">CRM completo com histórico e segmentação</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); resetForm(); }}>
              <Plus className="mr-2 h-4 w-4" /> Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nome *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Telefone *</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99999-9999" />
                </div>
                <div className="grid gap-2">
                  <Label>E-mail</Label>
                  <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Data Nascimento</Label>
                  <Input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>CPF</Label>
                  <Input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Observações / Alergias</Label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((client) => (
            <Card key={client.id} className="relative group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-rose-500" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{client.name}</CardTitle>
                      <Badge variant="secondary" className={segmentColors[client.segment] + " mt-1 text-[10px]"}>
                        {segmentLabels[client.segment]}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(client)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => salon && deleteMutation.mutate({ id: client.id, salonId: salon.id })}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{client.phone}</span>
                </div>
                {client.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{client.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{client.totalVisits} visitas | R$ {client.totalSpent}</span>
                </div>
                {client.consentGiven && (
                  <div className="flex items-center gap-2 text-emerald-600 text-xs">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>LGPD consentido</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Nenhum cliente encontrado.</p>
          <p className="text-sm">Cadastre seu primeiro cliente para começar.</p>
        </div>
      )}
    </div>
  );
}
