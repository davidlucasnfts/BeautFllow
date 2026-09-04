import type { SalonSegment } from "./segment-labels";

export type SegmentMessageTemplate = {
  confirmation: (
    clientName: string,
    serviceName: string,
    date: string,
    professionalName: string
  ) => string;
  reminder: (clientName: string, serviceName: string, date: string) => string;
  reactivation: (clientName: string) => string;
};

export const segmentMessageTemplates: Record<
  SalonSegment,
  SegmentMessageTemplate
> = {
  beauty_salon: {
    confirmation: (clientName, serviceName, date, professionalName) =>
      `Olá, ${clientName}! Seu agendamento de ${serviceName} está confirmado para ${date} com ${professionalName}.`,
    reminder: (clientName, serviceName, date) =>
      `Oi, ${clientName}! Lembramos que você tem ${serviceName} agendado para ${date}.`,
    reactivation: clientName =>
      `Oi, ${clientName}! Sentimos sua falta. Que tal agendar um horário para cuidar de você?`,
  },
  barbershop: {
    confirmation: (clientName, serviceName, date, professionalName) =>
      `E aí, ${clientName}! Seu ${serviceName} está confirmado para ${date} com o barbeiro ${professionalName}.`,
    reminder: (clientName, serviceName, date) =>
      `Fala, ${clientName}! Te lembrando que seu ${serviceName} é ${date}.`,
    reactivation: clientName =>
      `E aí, ${clientName}! Sua barba está pedindo cuidado. Bora marcar um horário?`,
  },
  aesthetic_clinic: {
    confirmation: (clientName, serviceName, date, professionalName) =>
      `Olá, ${clientName}! Seu procedimento de ${serviceName} está confirmado para ${date} com ${professionalName}.`,
    reminder: (clientName, serviceName, date) =>
      `Olá, ${clientName}! Lembramos do seu procedimento ${serviceName} agendado para ${date}.`,
    reactivation: clientName =>
      `Olá, ${clientName}! Cuidar da pele é rotina. Vamos agendar seu próximo procedimento?`,
  },
};

export function getSegmentMessageTemplate(
  segment: SalonSegment
): SegmentMessageTemplate {
  return segmentMessageTemplates[segment];
}
