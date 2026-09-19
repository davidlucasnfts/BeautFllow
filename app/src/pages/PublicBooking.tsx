import { useState } from "react";
import { useParams } from "react-router";
import { keepPreviousData } from "@tanstack/react-query";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarCheck, Clock, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import {
  getTheme,
  getSegmentPalette,
} from "@contracts/segment-palettes";
import type { SalonSegment } from "@contracts/segment-labels";
import {
  onlyText,
  maskPhoneBR,
  dateBRToISO,
  moneyDotToBR,
} from "@/lib/input-masks";
import DatePicker from "@/components/DatePicker";
import { generateTimeSlots, filterAvailableSlots } from "@/lib/time-slots";

type BookResult = {
  salonName: string;
  serviceName: string;
  date: string;
  startTime: string;
  endTime: string;
  clientName: string;
};

export default function PublicBooking() {
  const { slug } = useParams<{ slug: string }>();
  const [serviceId, setServiceId] = useState("");
  const [professionalId, setProfessionalId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<BookResult | null>(null);

  const { data, isLoading, error } = trpc.public.bookingPage.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug }
  );

  // Horários livres do dia escolhido (grade de 30 em 30 min)
  // `date` já é ISO — vem direto do DatePicker
  const isoDate = date;
  const { data: slotsData, isFetching: isFetchingSlots } =
    trpc.public.availableSlots.useQuery(
      {
        slug: slug ?? "",
        date: isoDate,
        serviceId: Number(serviceId),
        professionalId: professionalId ? Number(professionalId) : undefined,
      },
      {
        enabled: !!slug && !!serviceId && !!isoDate,
        // evita o flicker "Sem horários" enquanto recarrega ao trocar data/profissional
        placeholderData: keepPreviousData,
      }
    );

  const service = data?.services.find(s => s.id === Number(serviceId));
  // sem serviço + data válida, a grade fica vazia (campo travado com orientação)
  const allSlots = slotsData
    ? generateTimeSlots(
        slotsData.dayStart,
        slotsData.dayEnd,
        slotsData.slotMinutes
      )
    : [];

  // "agora" no fuso de Brasília, calculado uma vez (não por slot)
  const nowBR = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
  );
  const todayBR = dateBRToISO(
    nowBR.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  );

  const availableSlots = (
    // "Sem preferência": o backend devolve os slots onde ALGUM profissional
    // está livre (freeSlots); com profissional escolhido, filtra pela grade
    !professionalId && slotsData?.freeSlots
      ? slotsData.freeSlots
      : filterAvailableSlots(
          allSlots,
          slotsData?.busyIntervals ?? [],
          service?.durationMinutes ?? 30
        )
  ).filter(slot => {
    // se a data for hoje, esconde horários que já passaram
    if (isoDate !== todayBR) return true;
    return new Date(`${isoDate}T${slot}:00`) >= nowBR;
  });

  // horário efetivo: se o escolhido saiu da lista (trocou serviço/profissional/
  // data), trata como não escolhido — impede enviar horário inválido ao backend
  const effectiveStartTime = availableSlots.includes(startTime)
    ? startTime
    : "";

  const bookMutation = trpc.public.book.useMutation({
    onSuccess: res => {
      setResult(res);
      window.scrollTo({ top: 0 });
    },
    onError: e => toast.error(e.message),
  });

  const segment = (data?.salon.segment ?? "beauty_salon") as SalonSegment;
  // tema escolhido pelo dono no painel; o backend já cai no padrão do
  // segmento quando ausente (defaultThemeForSegment no public-router)
  const palette =
    getTheme(data?.salon.theme ?? "")?.palette ?? getSegmentPalette(segment);

  function handleSubmit() {
    if (!data) return;
    if (!serviceId) {
      toast.error("Escolha um serviço.");
      return;
    }
    if (!date) {
      toast.error("Escolha uma data.");
      return;
    }
    if (!effectiveStartTime) {
      toast.error("Escolha um horário disponível.");
      return;
    }
    if (name.trim().length < 2) {
      toast.error("Informe seu nome.");
      return;
    }
    if (!/^\(\d{2}\) \d{4,5}-\d{4}$/.test(phone)) {
      toast.error("Informe um telefone válido com DDD.");
      return;
    }
    bookMutation.mutate({
      slug: data.salon.slug,
      name: name.trim(),
      phone,
      serviceId: Number(serviceId),
      professionalId: professionalId ? Number(professionalId) : undefined,
      date: isoDate,
      startTime: effectiveStartTime,
      notes: notes.trim() || undefined,
    });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <p className="text-slate-500">Carregando...</p>
      </div>
    );
  }

  if (!data || error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-slate-800">
            Endereço não encontrado
          </p>
          <p className="text-slate-500 text-sm">
            Confira o link que você recebeu e tente novamente.
          </p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8 text-center space-y-4">
          <div
            className="mx-auto h-14 w-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: palette.primary + "22" }}
          >
            <CalendarCheck
              className="h-7 w-7"
              style={{ color: palette.primary }}
            />
          </div>
          <h1 className="text-xl font-bold text-slate-800">
            Agendamento enviado!
          </h1>
          <p className="text-slate-500 text-sm">
            <strong>{result.salonName}</strong> vai confirmar seu horário pelo
            WhatsApp.
          </p>
          <div className="rounded-lg bg-slate-50 p-4 text-sm text-left space-y-2">
            <p>
              <strong>Serviço:</strong> {result.serviceName}
            </p>
            <p>
              <strong>Data:</strong>{" "}
              {result.date.split("-").reverse().join("/")}
            </p>
            <p>
              <strong>Horário:</strong> {result.startTime} às {result.endTime}
            </p>
            <p>
              <strong>Nome:</strong> {result.clientName}
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setResult(null)}
          >
            Fazer outro agendamento
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="mx-auto max-w-md space-y-6">
        <header className="text-center space-y-2">
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: palette.primary }}
          >
            {data.salon.name}
          </h1>
          {(data.salon.address || data.salon.city) && (
            <p className="text-sm text-slate-500 flex items-center justify-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {[data.salon.address, data.salon.city, data.salon.state]
                .filter(Boolean)
                .join(", ")}
            </p>
          )}
          {data.salon.phone && (
            <p className="text-sm text-slate-500 flex items-center justify-center gap-1">
              <Phone className="h-3.5 w-3.5" /> {data.salon.phone}
            </p>
          )}
          <p className="text-slate-600">Agende seu horário abaixo</p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-5">
          {data.services.length === 0 ? (
            <div className="text-center space-y-2 py-6">
              <p className="text-sm text-slate-600">
                Nenhum serviço disponível para agendamento online no momento.
              </p>
              {data.salon.phone && (
                <p className="text-sm text-slate-500 flex items-center justify-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  Fale com {data.salon.name}: {data.salon.phone}
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="grid gap-2">
                <Label>Serviço *</Label>
                <Select
                  value={serviceId}
                  onValueChange={v => {
                    setServiceId(v);
                    setStartTime(""); // duração muda → horários mudam
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.services.map(s => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name} — R$ {moneyDotToBR(String(s.price))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {data.professionals.length > 0 && (
                <div className="grid gap-2">
                  <Label>Profissional (opcional)</Label>
                  <Select
                    value={professionalId}
                    onValueChange={v => {
                      setProfessionalId(v);
                      setStartTime(""); // agenda do profissional muda
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sem preferência" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.professionals.map(p => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Data *</Label>
                  <DatePicker
                    value={date}
                    onChange={v => {
                      setDate(v);
                      setStartTime(""); // horários do dia mudam
                    }}
                    placeholder="Escolha a data"
                    fromDate={new Date()}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Horário *</Label>
                  <Select
                    value={effectiveStartTime}
                    onValueChange={setStartTime}
                    disabled={!serviceId || !isoDate}
                  >
                    <SelectTrigger>
                      <SelectValue
                        className="truncate"
                        placeholder={
                          !serviceId
                            ? "Escolha o serviço"
                            : !isoDate
                              ? "Informe a data"
                              : isFetchingSlots
                                ? "Carregando..."
                                : availableSlots.length === 0
                                  ? "Sem horários"
                                  : "Selecione"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSlots.map(slot => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Seu nome *</Label>
                <Input
                  value={name}
                  onChange={e => setName(onlyText(e.target.value))}
                  placeholder="Nome completo"
                />
              </div>

              <div className="grid gap-2">
                <Label>Seu WhatsApp *</Label>
                <Input
                  value={phone}
                  onChange={e => setPhone(maskPhoneBR(e.target.value))}
                  placeholder="(11) 99999-9999"
                  inputMode="numeric"
                />
              </div>

              <div className="grid gap-2">
                <Label>Observações</Label>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Opcional"
                  rows={3}
                />
              </div>

              <Button
                className="w-full text-white"
                style={{ backgroundColor: palette.primary }}
                onClick={handleSubmit}
                disabled={bookMutation.isPending}
              >
                <CalendarCheck className="mr-2 h-4 w-4" />
                {bookMutation.isPending ? "Enviando..." : "Agendar"}
              </Button>

              <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" />O salão confirma seu horário pelo
                WhatsApp
              </p>
            </>
          )}
        </div>

        <footer className="text-center text-xs text-slate-400">
          Agendamento online por StudioFlow
        </footer>
      </div>
    </div>
  );
}
