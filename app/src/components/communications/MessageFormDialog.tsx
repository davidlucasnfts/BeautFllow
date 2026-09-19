import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type MessageChannel = "whatsapp" | "sms" | "email" | "in_app";
type MessageType =
  | "confirmation"
  | "reminder"
  | "check_in"
  | "post_care"
  | "reactivation"
  | "campaign"
  | "manual";

export interface MessagePreset {
  clientId: number;
  type: string;
  channel: string;
  content: string;
}

interface MessageFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: { id: number; name: string }[];
  /** Dados de uma mensagem anterior para reenvio (reabre pré-preenchido) */
  preset: MessagePreset | null;
  isPending: boolean;
  onSubmit: (data: {
    clientId: number;
    channel: MessageChannel;
    type: MessageType;
    content: string;
  }) => void;
}

const CHANNELS: { value: MessageChannel; label: string }[] = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "sms", label: "SMS" },
  { value: "email", label: "E-mail" },
];

const TYPES: { value: MessageType; label: string }[] = [
  { value: "confirmation", label: "Confirmação" },
  { value: "reminder", label: "Lembrete" },
  { value: "post_care", label: "Pós-cuidado" },
  { value: "reactivation", label: "Trazer de volta" },
  { value: "manual", label: "Escrita por você" },
];

export default function MessageFormDialog({
  open,
  onOpenChange,
  clients,
  preset,
  isPending,
  onSubmit,
}: MessageFormDialogProps) {
  const [form, setForm] = useState({
    clientId: "",
    type: "manual" as MessageType,
    channel: "whatsapp" as MessageChannel,
    content: "",
  });

  const [syncedKey, setSyncedKey] = useState("");
  const syncKey = `${open}|${preset ? `${preset.clientId}:${preset.content.length}` : "new"}`;
  if (open && syncKey !== syncedKey) {
    setSyncedKey(syncKey);
    if (preset) {
      setForm({
        clientId: String(preset.clientId),
        type: TYPES.some(t => t.value === preset.type)
          ? (preset.type as MessageType)
          : "manual",
        channel: CHANNELS.some(c => c.value === preset.channel)
          ? (preset.channel as MessageChannel)
          : "whatsapp",
        content: preset.content,
      });
    } else {
      setForm({
        clientId: "",
        type: "manual",
        channel: "whatsapp",
        content: "",
      });
    }
  }

  function handleSubmit() {
    onSubmit({
      clientId: Number(form.clientId),
      channel: form.channel,
      type: form.type,
      content: form.content,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {preset ? "Reenviar Mensagem" : "Nova Mensagem"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Cliente</Label>
            <Select
              value={form.clientId}
              onValueChange={v => setForm({ ...form, clientId: v })}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder="Escolha o cliente"
                  className="truncate"
                />
              </SelectTrigger>
              <SelectContent className="z-[60]">
                {clients.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Onde enviar</Label>
              <Select
                value={form.channel}
                onValueChange={(v: MessageChannel) =>
                  setForm({ ...form, channel: v })
                }
              >
                <SelectTrigger>
                  <SelectValue className="truncate" />
                </SelectTrigger>
                <SelectContent className="z-[60]">
                  {CHANNELS.map(c => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Tipo</Label>
              <Select
                value={form.type}
                onValueChange={(v: MessageType) =>
                  setForm({ ...form, type: v })
                }
              >
                <SelectTrigger>
                  <SelectValue className="truncate" />
                </SelectTrigger>
                <SelectContent className="z-[60]">
                  {TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Mensagem</Label>
            <Textarea
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isPending}>
            <Send className="mr-2 h-4 w-4" />
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
