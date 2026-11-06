import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { keepPreviousData } from "@tanstack/react-query";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarCheck, Clock, Phone } from "lucide-react";
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
import { generateTimeSlots, filterAvailableSlots } from "@/lib/time-slots";
import PublicBookingHeader from "@/components/public-booking/PublicBookingHeader";
import PublicBookingPaused from "@/components/public-booking/PublicBookingPaused";
import PublicBookingResult, {
  type BookResult,
} from "@/components/public-booking/PublicBookingResult";
import BookingDateTimeFields from "@/components/public-booking/BookingDateTimeFields";
import BookingSteps from "@/components/public-booking/BookingSteps";
import BookingSummary from "@/components/public-booking/BookingSummary";
import LgpdCheckbox from "@/components/public-booking/LgpdCheckbox";

export default function PublicBooking() {
  const { slug } = useParams<{ slug: string }>();
  const [serviceId, setServiceId] = useState("");
  const [professionalId, setProfessionalId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [lgpdAccepted, setLgpdAccepted] = useState(false);
  const [result, setResult] = useState<BookResult | null>(null);
  const [nameManuallyEdited, setNameManuallyEdited] = useState(false);

  const { data, isLoading, error } = trpc.public.bookingPage.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug }
  );

  // Busca cliente existente pelo telefone para preencher o nome automaticamente
  const { data: existingClient } = trpc.public.findClientByPhone.useQuery(
    { slug: slug ?? "", phone },
    { enabled: !!slug && /^\(\d{2}\) \d{4,5}-\d{4}$/.test(phone) }
  );

  useEffect(() => {
    if (existingClient?.name && !nameManuallyEdited) {
      setName(existingClient.name);
    }
  }, [existingClient, nameManuallyEdited]);

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

  // Regras do estabelecimento: antecedência mínima e pausa/almoço
  // (o backend já filtra no fluxo "sem preferência" — aqui cobre o fluxo
  //  com profissional escolhido, com os mesmos dados)
  const schedule = data?.salon.schedule;
  const slotsRespectingRules = schedule
    ? availableSlots.filter(slot => {
        const start = new Date(`${isoDate}T${slot}:00`);
        if (start < new Date(nowBR.getTime() + schedule.minAdvanceMinutes * 60_000))
          return false;
        if (
          schedule.breakStart &&
          schedule.breakEnd &&
          slot >= schedule.breakStart &&
          slot < schedule.breakEnd
        )
          return false;
        return true;
      })
    : availableSlots;

  // dia fora do funcionamento (ex.: domingo fechado)
  const closedDay =
    !!schedule &&
    !!isoDate &&
    !schedule.workDays.includes(new Date(`${isoDate}T12:00:00`).getDay());

  // limite de antecedência máxima no seletor de data
  const maxBookingDate = new Date(nowBR);
  if (schedule) maxBookingDate.setDate(maxBookingDate.getDate() + schedule.maxAdvanceDays);

  // horário efetivo: se o escolhido saiu da lista (trocou serviço/profissional/
  // data), trata como não escolhido — impede enviar horário inválido ao backend
  const effectiveStartTime = slotsRespectingRules.includes(startTime)
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
    if (!lgpdAccepted) {
      toast.error("Aceite o uso dos dados para continuar.");
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

  // agendamento online pausado (férias/reforma): link continua ativo,
  // mas ninguém consegue agendar
  if (data.salon.schedule.onlineBookingPaused) {
    return <PublicBookingPaused salon={data.salon} primaryColor={palette.primary} />;
  }

  if (result) {
    return (
      <PublicBookingResult
        result={result}
        primaryColor={palette.primary}
        onReset={() => setResult(null)}
      />
    );
  }

  const currentStep =
    !serviceId ? 1 : !date || !effectiveStartTime ? 2 : 3;

  const selectedService = data?.services.find(s => s.id === Number(serviceId));
  const selectedProfessional = data?.professionals.find(
    p => p.id === Number(professionalId)
  );

  return (
    <div
      className="min-h-screen pb-24 pt-6 px-4"
      style={{
        background: `linear-gradient(180deg, ${palette.primary}10 0%, #ffffff 100%)`,
      }}
    >
      <div className="mx-auto max-w-md space-y-5">
        <PublicBookingHeader
          salon={data.salon}
          primaryColor={palette.primary}
          tagline="Agende seu horário abaixo"
        />

        <BookingSteps currentStep={currentStep} primaryColor={palette.primary} />

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-5">
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
              <section className="space-y-4">
                <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full text-white text-sm font-bold"
                    style={{ backgroundColor: palette.primary }}
                  >
                    1
                  </span>
                  Qual serviço?
                </p>
                <div className="grid gap-2">
                  <Label className="font-semibold text-slate-700">Serviço *</Label>
                  <Select
                    value={serviceId}
                    onValueChange={v => {
                      setServiceId(v);
                      setStartTime("");
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
                    <Label className="font-semibold text-slate-700">Profissional (opcional)</Label>
                    <Select
                      value={professionalId}
                      onValueChange={v => {
                        setProfessionalId(v);
                        setStartTime("");
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
              </section>

              <section className="space-y-4">
                <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full text-white text-sm font-bold"
                    style={{ backgroundColor: palette.primary }}
                  >
                    2
                  </span>
                  Quando?
                </p>
                <BookingDateTimeFields
                  date={date}
                  onDateChange={v => {
                    setDate(v);
                    setStartTime("");
                  }}
                  effectiveStartTime={effectiveStartTime}
                  onStartTimeChange={setStartTime}
                  hasService={!!serviceId}
                  isFetchingSlots={isFetchingSlots}
                  slots={slotsRespectingRules}
                  closedDay={closedDay}
                  maxBookingDate={maxBookingDate}
                />
              </section>

              <section className="space-y-4">
                <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full text-white text-sm font-bold"
                    style={{ backgroundColor: palette.primary }}
                  >
                    3
                  </span>
                  Seus dados
                </p>
                <div className="grid gap-2">
                  <Label className="font-semibold text-slate-700">Seu WhatsApp *</Label>
                  <Input
                    value={phone}
                    onChange={e => {
                      const masked = maskPhoneBR(e.target.value);
                      setPhone(masked);
                      if (masked.length < 14) {
                        setName("");
                        setNameManuallyEdited(false);
                      }
                    }}
                    placeholder="(11) 99999-9999"
                    inputMode="numeric"
                  />
                  {existingClient?.name && !nameManuallyEdited && (
                    <p className="text-xs text-slate-500">
                      Cliente encontrado: {existingClient.name}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label className="font-semibold text-slate-700">Seu nome *</Label>
                  <Input
                    value={name}
                    onChange={e => {
                      setName(onlyText(e.target.value));
                      setNameManuallyEdited(true);
                    }}
                    onFocus={() => setNameManuallyEdited(true)}
                    placeholder="Nome completo"
                  />
                </div>
              </section>

              <BookingSummary
                serviceName={selectedService?.name ?? ""}
                servicePrice={selectedService?.price}
                professionalName={
                  selectedProfessional?.name ??
                  (data.professionals.length > 0 ? "Sem preferência" : null)
                }
                date={date}
                startTime={effectiveStartTime}
                endTime={
                  effectiveStartTime && selectedService
                    ? (() => {
                        const [h, m] = effectiveStartTime.split(":").map(Number);
                        const total = h * 60 + m + selectedService.durationMinutes;
                        return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
                      })()
                    : undefined
                }
                clientName={name}
                primaryColor={palette.primary}
              />

              <LgpdCheckbox
                checked={lgpdAccepted}
                onCheckedChange={setLgpdAccepted}
              />

              <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" />
                O salão confirma seu horário pelo WhatsApp
              </p>
            </>
          )}
        </div>

        <footer className="text-center text-xs text-slate-400">
          Agendamento online por StudioFlow
        </footer>
      </div>

      {data.services.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white p-4 md:hidden">
          <Button
            className="w-full text-white h-12 text-base"
            style={{ backgroundColor: palette.primary }}
            onClick={handleSubmit}
            disabled={bookMutation.isPending || !lgpdAccepted}
          >
            <CalendarCheck className="mr-2 h-4 w-4" />
            {bookMutation.isPending ? "Enviando..." : "Agendar"}
          </Button>
        </div>
      )}

      <div className="hidden md:block">
        {data.services.length > 0 && (
          <div className="mx-auto max-w-md">
            <Button
              className="w-full text-white h-12 text-base"
              style={{ backgroundColor: palette.primary }}
              onClick={handleSubmit}
              disabled={bookMutation.isPending || !lgpdAccepted}
            >
              <CalendarCheck className="mr-2 h-4 w-4" />
              {bookMutation.isPending ? "Enviando..." : "Agendar"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
