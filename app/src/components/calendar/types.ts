export type ViewMode = "week" | "day";

export interface CalendarAppointment {
  id: number;
  clientId: number;
  professionalId: number | null;
  serviceId: number;
  appointmentDate: string;
  startTime: string;
  endTime: string | null;
  status: string;
  notes: string | null;
}

export interface DropPosition {
  appointmentId: number;
  newDate: string;
  newStartTime: string;
}

export interface CalendarProfessional {
  id: number;
  name: string;
  color: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface CalendarService {
  id: number;
  name: string;
  color: string | null;
  durationMinutes: number;
}

export interface CalendarClient {
  id: number;
  name: string;
}
