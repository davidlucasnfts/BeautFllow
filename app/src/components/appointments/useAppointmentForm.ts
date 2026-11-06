import { useState } from "react";
import { format } from "date-fns";
import type { CalendarAppointment } from "@/components/calendar/types";

export type AppointmentFormData = {
  clientId: string;
  professionalId: string;
  serviceId: string;
  /** Serviços adicionais feitos no mesmo atendimento (ids em string) */
  extraServiceIds: string[];
  appointmentDate: string;
  startTime: string;
  notes: string;
};

const EMPTY_FORM: AppointmentFormData = {
  clientId: "",
  professionalId: "",
  serviceId: "",
  extraServiceIds: [],
  appointmentDate: format(new Date(), "yyyy-MM-dd"),
  startTime: "09:00",
  notes: "",
};

export function useAppointmentForm() {
  const [form, setForm] = useState<AppointmentFormData>(EMPTY_FORM);

  function updateField<K extends keyof AppointmentFormData>(
    field: K,
    value: AppointmentFormData[K]
  ) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setForm({
      ...EMPTY_FORM,
      appointmentDate: format(new Date(), "yyyy-MM-dd"),
    });
  }

  function loadAppointment(appt: CalendarAppointment) {
    setForm({
      clientId: String(appt.clientId),
      professionalId: appt.professionalId ? String(appt.professionalId) : "",
      serviceId: String(appt.serviceId),
      extraServiceIds: (appt.extraServices ?? []).map(e => String(e.id)),
      appointmentDate: appt.appointmentDate,
      startTime: appt.startTime,
      notes: appt.notes ?? "",
    });
  }

  return { form, updateField, resetForm, setForm, loadAppointment };
}
