export type SalonSegment = "beauty_salon" | "barbershop" | "aesthetic_clinic";

export const segmentLabels: Record<
  SalonSegment,
  {
    segmentName: string;
    professional: string;
    client: string;
    service: string;
    appointment: string;
    dashboardTitle: string;
    welcomeMessage: string;
  }
> = {
  beauty_salon: {
    segmentName: "Salão de Beleza",
    professional: "Profissional",
    client: "Cliente",
    service: "Serviço",
    appointment: "Agendamento",
    dashboardTitle: "Meu Salão",
    welcomeMessage: "Bem-vindo ao seu salão de beleza",
  },
  barbershop: {
    segmentName: "Barbearia",
    professional: "Barbeiro",
    client: "Cliente",
    service: "Serviço",
    appointment: "Agendamento",
    dashboardTitle: "Minha Barbearia",
    welcomeMessage: "Bem-vindo à sua barbearia",
  },
  aesthetic_clinic: {
    segmentName: "Clínica de Estética",
    professional: "Terapeuta",
    client: "Paciente",
    service: "Procedimento",
    appointment: "Agendamento",
    dashboardTitle: "Minha Clínica",
    welcomeMessage: "Bem-vindo à sua clínica de estética",
  },
};

export function getSegmentLabel(
  segment: SalonSegment,
  key: keyof (typeof segmentLabels)["beauty_salon"]
) {
  return segmentLabels[segment][key];
}
