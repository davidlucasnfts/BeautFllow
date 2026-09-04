import type { SalonSegment } from "./segment-labels";

export type SegmentServiceTemplate = {
  name: string;
  durationMinutes: number;
  price: number;
  color: string;
};

export const segmentServiceTemplates: Record<
  SalonSegment,
  SegmentServiceTemplate[]
> = {
  beauty_salon: [
    {
      name: "Corte feminino",
      durationMinutes: 60,
      price: 80,
      color: "#E8A0BF",
    },
    { name: "Escova", durationMinutes: 45, price: 60, color: "#F472B6" },
    { name: "Coloração", durationMinutes: 120, price: 150, color: "#A855F7" },
    { name: "Manicure", durationMinutes: 45, price: 45, color: "#EC4899" },
  ],
  barbershop: [
    {
      name: "Corte masculino",
      durationMinutes: 30,
      price: 40,
      color: "#1F1F1F",
    },
    { name: "Barba", durationMinutes: 20, price: 25, color: "#A16207" },
    {
      name: "Combo corte + barba",
      durationMinutes: 50,
      price: 60,
      color: "#C9A227",
    },
    { name: "Hidratação", durationMinutes: 30, price: 35, color: "#92400E" },
  ],
  aesthetic_clinic: [
    {
      name: "Limpeza de pele",
      durationMinutes: 60,
      price: 120,
      color: "#10B981",
    },
    {
      name: "Drenagem linfática",
      durationMinutes: 50,
      price: 100,
      color: "#34D399",
    },
    { name: "Depilação", durationMinutes: 40, price: 70, color: "#059669" },
    {
      name: "Massagem modeladora",
      durationMinutes: 60,
      price: 110,
      color: "#047857",
    },
  ],
};

export function getSegmentServices(
  segment: SalonSegment
): SegmentServiceTemplate[] {
  return segmentServiceTemplates[segment];
}
