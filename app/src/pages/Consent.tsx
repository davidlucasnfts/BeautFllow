import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ShieldCheck,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Download,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import ConsentFormDialog from "@/components/consent/ConsentFormDialog";
import ConsentFormCard, {
  type ConsentFormItem,
} from "@/components/consent/ConsentFormCard";

export default function Consent() {
  const { salon } = useSalon();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ConsentFormItem | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    title: string;
  } | null>(null);

  const utils = trpc.useUtils();
  const { data: forms, isLoading, isError } = trpc.consent.list.useQuery(
    { salonId: salon?.id ?? 0 },
    { enabled: !!salon }
  );

  const createMutation = trpc.consent.create.useMutation({
    onSuccess: () => {
      utils.consent.list.invalidate();
      setOpen(false);
      toast.success("Termo criado");
    },
    onError: e => toast.error(e.message),
  });

  const updateMutation = trpc.consent.update.useMutation({
    onSuccess: () => {
      utils.consent.list.invalidate();
      setOpen(false);
      setEditing(null);
      toast.success("Termo atualizado");
    },
    onError: e => toast.error(e.message),
  });

  const deleteMutation = trpc.consent.delete.useMutation({
    onSuccess: () => {
      utils.consent.list.invalidate();
      setExpandedId(null);
      setDeleteTarget(null);
      toast.success("Termo excluído");
    },
    onError: e => toast.error(e.message),
  });

  function handleEdit(form: ConsentFormItem) {
    setEditing(form);
    setOpen(true);
  }

  function handleSubmit(data: { title: string; content: string }) {
    if (!salon) return;
    if (editing) {
      updateMutation.mutate({ id: editing.id, salonId: salon.id, ...data });
    } else {
      createMutation.mutate({ salonId: salon.id, ...data });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Termos e Autorizações
          </h1>
          <p className="text-muted-foreground">
            Autorizações que seus clientes assinam no celular
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Termo
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4 border-emerald-200 bg-emerald-50/30">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-emerald-800">
                Proteção de dados (LGPD)
              </p>
              <p className="text-xs text-emerald-700 mt-1">
                Coleta só o necessário, autorização clara do cliente, e tudo
                fica registrado com data e hora.
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-amber-200 bg-amber-50/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Termos Digitais
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Assinatura pelo celular com data, hora e registro do aparelho.
                Vale por lei para procedimentos estéticos.
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-blue-200 bg-blue-50/30">
          <div className="flex items-start gap-3">
            <Download className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Cópia dos dados
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Cliente pode pedir uma cópia de tudo que guardamos, fácil de
                ler.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Termos de Autorização em uso
        </h2>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 bg-muted" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg">
            <ShieldCheck className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p>Falha ao carregar. Atualize a página.</p>
          </div>
        ) : forms && forms.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {forms.map(f => (
              <ConsentFormCard
                key={f.id}
                form={f}
                expanded={expandedId === f.id}
                onToggle={() =>
                  setExpandedId(expandedId === f.id ? null : f.id)
                }
                onEdit={() => handleEdit(f)}
                onDelete={() =>
                  setDeleteTarget({ id: f.id, title: f.title })
                }
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground border rounded-lg">
            <ShieldCheck className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p>Nenhum termo cadastrado.</p>
            <p className="text-sm">
              Crie termos de autorização para procedimentos que exigem
              autorização.
            </p>
          </div>
        )}
      </div>

      <ConsentFormDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        isPending={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
        itemType="termo de autorização"
        itemName={deleteTarget?.title ?? ""}
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
