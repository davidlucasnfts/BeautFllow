import { useState } from "react";
import { format } from "date-fns";
import { FileText, PenLine, Eye } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { renderTermContent } from "@/components/consent/render-term";

type ConsentFormItem = {
  id: number;
  title: string;
  content: string;
};

type SignatureItem = {
  formId: number;
  signatureData: string | null;
  signedAt: string | Date;
};

type ModalState =
  | { mode: "sign"; form: ConsentFormItem }
  | { mode: "view"; form: ConsentFormItem; signature: SignatureItem };

/** Texto exibido no modal: o que foi efetivamente assinado, se existir */
function signedText(signature: SignatureItem, form: ConsentFormItem): string {
  try {
    const parsed = JSON.parse(signature.signatureData ?? "");
    if (typeof parsed.text === "string" && parsed.text) return parsed.text;
  } catch {
    // assinatura antiga sem JSON — cai no conteúdo atual do termo
  }
  return form.content;
}

/** Seção "Termos e autorizações" da ficha expandida do cliente */
export default function ClientConsentSection({
  client,
  salonId,
  salonName,
}: {
  client: { id: number; name: string };
  salonId: number;
  salonName: string;
}) {
  const [modal, setModal] = useState<ModalState | null>(null);
  const utils = trpc.useUtils();

  const { data: forms } = trpc.consent.list.useQuery({ salonId });
  const { data: signatures } = trpc.consent.signaturesByClient.useQuery({
    salonId,
    clientId: client.id,
  });

  const signMutation = trpc.consent.sign.useMutation({
    onSuccess: () => {
      utils.consent.signaturesByClient.invalidate();
      utils.consent.list.invalidate();
      setModal(null);
      toast.success("Assinatura registrada");
    },
    onError: e => toast.error(e.message),
  });

  function confirmSign(form: ConsentFormItem) {
    const text = renderTermContent(form.content, {
      clientName: client.name,
      salonName,
    });
    signMutation.mutate({
      salonId,
      formId: form.id,
      clientId: client.id,
      signatureData: JSON.stringify({
        text,
        agreedAt: new Date().toISOString(),
      }),
    });
  }

  const signatureFor = (formId: number) =>
    signatures?.find(s => s.formId === formId);

  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 space-y-2">
      <p className="text-[10px] font-semibold text-slate-400 uppercase">
        Termos e autorizações
      </p>
      {!forms || forms.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Nenhum termo cadastrado. Crie em Termos e Autorizações.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {forms.map(form => {
            const signature = signatureFor(form.id);
            return (
              <li
                key={form.id}
                className="flex flex-wrap items-center gap-x-2 gap-y-1"
              >
                <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="text-sm font-medium text-slate-800 break-words basis-40 min-w-0 flex-1">
                  {form.title}
                </span>
                {signature ? (
                  <>
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-700 text-[10px]"
                    >
                      Assinado em{" "}
                      {format(
                        new Date(signature.signedAt),
                        "dd/MM/yyyy"
                      )}
                    </Badge>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setModal({ mode: "view", form, signature });
                      }}
                      className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md border transition-colors border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Ver
                    </button>
                  </>
                ) : (
                  <>
                    <Badge
                      variant="secondary"
                      className="bg-slate-100 text-slate-600 text-[10px]"
                    >
                      Não assinado
                    </Badge>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setModal({ mode: "sign", form });
                      }}
                      className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md border transition-colors border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                    >
                      <PenLine className="h-3.5 w-3.5" />
                      Registrar assinatura
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={modal !== null}
        onOpenChange={open => !open && setModal(null)}
      >
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>{modal?.form.title}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-4 overflow-y-auto min-h-0">
            {modal?.mode === "sign" && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5">
                Confirme que o cliente leu e concordou com o termo. O registro
                fica vinculado ao seu usuário como responsável.
              </p>
            )}
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 whitespace-pre-wrap break-words">
              {modal &&
                (modal.mode === "view"
                  ? signedText(modal.signature, modal.form)
                  : renderTermContent(modal.form.content, {
                      clientName: client.name,
                      salonName,
                    }))}
            </div>
          </div>
          <DialogFooter className="shrink-0">
            <DialogClose asChild>
              <Button variant="outline">
                {modal?.mode === "view" ? "Fechar" : "Cancelar"}
              </Button>
            </DialogClose>
            {modal?.mode === "sign" && (
              <Button
                onClick={() => confirmSign(modal.form)}
                disabled={signMutation.isPending}
              >
                Confirmar assinatura
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
