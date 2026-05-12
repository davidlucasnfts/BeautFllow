import { useState } from "react";
import { format } from "date-fns";

export type AppointmentFormData = {
  clientId: string;
  professionalId: string;
  serviceId: string;
  appointmentDate: string;
  startTime: string;
  notes: string;
};

export function useAppointmentForm() {
  const [form, setForm] = useState<AppointmentFormData>({
    clientId: "",
    professionalId: "",
    serviceId: "",
    appointmentDate: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    notes: "",
  });

  function updateField<K extends keyof AppointmentFormData>(
    field: K,
    value: AppointmentFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setForm({
      clientId: "",
      professionalId: "",
      serviceId: "",
      appointmentDate: format(new Date(), "yyyy-MM-dd"),
      startTime: "09:00",
      notes: "",
    });
  }

  return { form, updateField, resetForm, setForm };
}
