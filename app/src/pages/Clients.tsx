import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { Button } from "@/components/ui/button";
import { getSegmentLabel } from "@contracts/segment-labels";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Phone,
  Users,
  Trash2,
  Edit3,
  ShieldCheck,
  ChevronDown,
  MessageCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import { onlyText, maskPhoneBR } from "@/lib/input-masks";
import DatePicker from "@/components/DatePicker";
import ClientCardDetails from "@/components/clients/ClientCardDetails";
import { getSegmentPalette } from "@contracts/segment-palettes";

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
  at_risk: "Sumindo",
  inactive: "Inativo",
};

export default function Clients() {
  const { salon } = useSalon();
  const segmentLabel = (key: Parameters<typeof getSegmentLabel>[1]) =>
    salon
      ? getSegmentLabel(salon.segment, key)
      : getSegmentLabel("beauty_salon", key);
  const palette = getSegmentPalette(salon?.segment ?? "beauty_salon");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    birthDate: "",
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
      toast.success(`${segmentLabel("client")} cadastrado com sucesso`);
    },
    onError: e => toast.error(e.message),
  });

  const updateMutation = trpc.customer.update.useMutation({
    onSuccess: () => {
      utils.customer.list.invalidate();
      setOpen(false);
      setEditing(null);
      resetForm();
      toast.success(`${segmentLabel("client")} atualizado`);
    },
    onError: e => toast.error(e.message),
  });

  const deleteMutation = trpc.customer.delete.useMutation({
    onSuccess: () => {
      utils.customer.list.invalidate();
      setSelectedId(null);
      setDeleteTarget(null);
      toast.success(`${segmentLabel("client")} apagado dos registros`);
    },
    onError: e => toast.error(e.message),
  });

  const filtered = search
    ? clients?.filter(
        c =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.phone.includes(search)
      )
    : clients;

  function resetForm() {
    setForm({
      name: "",
      phone: "",
      birthDate: "",
      notes: "",
      tags: "",
    });
  }

  function handleEdit(client: NonNullable<typeof clients>[number]) {
    setEditing(client.id);
    setForm({
      name: client.name,
      phone: client.phone,
      birthDate: client.birthDate ?? "",
      notes: client.notes ?? "",
      tags: client.tags ?? "",
    });
    setOpen(true);
  }

  function handleSubmit() {
    if (!salon) return;
    const payload = { ...form };
    if (editing) {
      updateMutation.mutate({
        id: editing,
        salonId: salon.id,
        ...payload,
      });
    } else {
      createMutation.mutate({
        salonId: salon.id,
        ...payload,
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {segmentLabel("client")}s
          </h1>
          <p className="text-muted-foreground">
            Toda a ficha dos seus clientes: contatos, visitas e histórico
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditing(null);
                resetForm();
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Novo {segmentLabel("client")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing
                  ? `Editar ${segmentLabel("client")}`
                  : `Novo ${segmentLabel("client")}`}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nome *</Label>
                <Input
                  value={form.name}
                  onChange={e =>
                    setForm({ ...form, name: onlyText(e.target.value) })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Telefone (WhatsApp) *</Label>
                <Input
                  value={form.phone}
                  onChange={e =>
                    setForm({ ...form, phone: maskPhoneBR(e.target.value) })
                  }
                  placeholder="(11) 99999-9999"
                  inputMode="numeric"
                />
              </div>
              <div className="grid gap-2">
                <Label>Data Nascimento</Label>
                <DatePicker
                  value={form.birthDate}
                  onChange={iso => setForm({ ...form, birthDate: iso })}
                  placeholder="Selecione"
                />
              </div>
              <div className="grid gap-2">
                <Label>Observações / Alergias</Label>
                <Input
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Tags</Label>
                <Input
                  value={form.tags}
                  onChange={e => setForm({ ...form, tags: e.target.value })}
                  placeholder="Ex: loiro, corte curto"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
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
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full bg-muted" />
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(client => (
            <Card
              key={client.id}
              className="relative group h-full cursor-pointer gap-1.5 py-2.5"
              onClick={() =>
                setSelectedId(client.id === selectedId ? null : client.id)
              }
            >
              <CardHeader className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <div
                      className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                      style={{
                        backgroundColor: `${palette.primary}2E`,
                        color: palette.primary,
                      }}
                    >
                      {client.name.trim().charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-base">{client.name}</CardTitle>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <Badge
                          variant="secondary"
                          className={
                            segmentColors[client.segment] + " text-[10px]"
                          }
                        >
                          {segmentLabels[client.segment]}
                        </Badge>
                        {client.consentGiven && (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-100 text-emerald-700 text-[10px]"
                          >
                            <ShieldCheck className="w-3 h-3 mr-0.5" />
                            Dados autorizados
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{client.phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0 w-[92px]">
                    <a
                      href={`https://wa.me/55${client.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="flex items-center justify-center gap-1.5 px-2 py-1 text-[11px] font-semibold rounded-md shadow-sm bg-green-600 text-white hover:bg-green-700"
                    >
                      <MessageCircle className="w-3 h-3" />
                      WhatsApp
                    </a>
                    <Button
                      type="button"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        handleEdit(client);
                      }}
                      className="h-auto gap-1.5 px-2 py-1 text-[11px] shadow-sm"
                    >
                      <Edit3 className="w-3 h-3" />
                      Editar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {selectedId === client.id && (
                <CardContent className="px-4 pb-2 pt-0 space-y-4">
                  <ClientCardDetails client={client} />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setDeleteTarget({
                          id: client.id,
                          name: client.name,
                        });
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-md bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="w-3 h-3" />
                      Excluir {segmentLabel("client")}
                    </button>
                  </div>
                </CardContent>
              )}
              <div className="flex justify-center pb-1.5">
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    selectedId === client.id ? "rotate-180" : ""
                  }`}
                />
              </div>
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

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
        itemType={segmentLabel("client")}
        itemName={deleteTarget?.name ?? ""}
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
