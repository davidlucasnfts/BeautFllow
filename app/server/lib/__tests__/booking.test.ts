import { describe, it, expect } from "vitest";
import {
  addMinutes,
  floorToSlot,
  generateSlots,
  intervalsOverlap,
  isProfessionalFree,
  findFreeProfessional,
  freeSlotsForAnyone,
  type BusyAppointment,
} from "../booking";

describe("addMinutes", () => {
  it("soma minutos dentro do mesmo dia", () => {
    expect(addMinutes("09:00", 30)).toBe("09:30");
    expect(addMinutes("09:30", 45)).toBe("10:15");
  });

  it("vira o dia quando passa de 23:59", () => {
    expect(addMinutes("23:45", 30)).toBe("00:15");
  });
});

describe("floorToSlot", () => {
  it("arredonda para baixo no step", () => {
    expect(floorToSlot("09:10", 30)).toBe("09:00");
    expect(floorToSlot("09:29", 30)).toBe("09:00");
    expect(floorToSlot("09:30", 30)).toBe("09:30");
    expect(floorToSlot("09:45", 15)).toBe("09:45");
  });
});

describe("generateSlots", () => {
  it("gera a grade respeitando inicio, fim e step", () => {
    expect(generateSlots("08:00", "10:00", 30)).toEqual([
      "08:00",
      "08:30",
      "09:00",
      "09:30",
    ]);
  });

  it("não inclui o horário de fechamento", () => {
    expect(generateSlots("08:00", "08:30", 30)).toEqual(["08:00"]);
  });
});

describe("intervalsOverlap", () => {
  it("detecta sobreposição real", () => {
    expect(intervalsOverlap("09:00", "10:00", "09:30", "10:30")).toBe(true);
    expect(intervalsOverlap("09:30", "10:30", "09:00", "10:00")).toBe(true);
  });

  it("extremos se tocando NÃO são conflito (10:00 termina, 10:00 começa)", () => {
    expect(intervalsOverlap("09:00", "10:00", "10:00", "11:00")).toBe(false);
    expect(intervalsOverlap("10:00", "11:00", "09:00", "10:00")).toBe(false);
  });

  it("intervalos separados não são conflito", () => {
    expect(intervalsOverlap("09:00", "10:00", "10:30", "11:00")).toBe(false);
  });
});

describe("isProfessionalFree", () => {
  const appt = (
    professionalId: number | null,
    startTime: string,
    endTime: string | null,
    status = "scheduled"
  ): BusyAppointment => ({ professionalId, startTime, endTime, status });

  it("livre quando não tem agendamento", () => {
    expect(isProfessionalFree(1, [], "09:00", "09:30")).toBe(true);
  });

  it("ocupado quando há sobreposição", () => {
    const busy = [appt(1, "09:00", "10:00")];
    expect(isProfessionalFree(1, busy, "09:30", "10:30")).toBe(false);
  });

  it("livre quando o agendamento é de outro profissional", () => {
    const busy = [appt(2, "09:00", "10:00")];
    expect(isProfessionalFree(1, busy, "09:00", "09:30")).toBe(true);
  });

  it("ignora cancelado e no_show (horário reaproveitável)", () => {
    const busy = [appt(1, "09:00", "10:00", "cancelled")];
    expect(isProfessionalFree(1, busy, "09:00", "09:30")).toBe(true);
    const noShow = [appt(1, "09:00", "10:00", "no_show")];
    expect(isProfessionalFree(1, noShow, "09:30", "10:00")).toBe(true);
  });

  it("ignora agendamento sem endTime", () => {
    const busy = [appt(1, "09:00", null)];
    expect(isProfessionalFree(1, busy, "09:00", "09:30")).toBe(true);
  });
});

describe("findFreeProfessional", () => {
  const pros = [{ id: 1 }, { id: 2 }];
  const appt = (
    professionalId: number,
    startTime: string,
    endTime: string
  ): BusyAppointment => ({
    professionalId,
    startTime,
    endTime,
    status: "scheduled",
  });

  it("retorna o primeiro profissional livre", () => {
    const busy = [appt(1, "09:00", "10:00")];
    expect(findFreeProfessional(pros, busy, "09:00", "09:30")?.id).toBe(2);
  });

  it("retorna null quando todos estão ocupados", () => {
    const busy = [appt(1, "09:00", "10:00"), appt(2, "09:00", "10:00")];
    expect(findFreeProfessional(pros, busy, "09:30", "10:00")).toBeNull();
  });

  it("retorna null sem profissionais", () => {
    expect(findFreeProfessional([], [], "09:00", "09:30")).toBeNull();
  });
});

describe("freeSlotsForAnyone", () => {
  const schedule = { dayStart: "08:00", dayEnd: "10:00", slotMinutes: 60 };
  const appt = (
    professionalId: number,
    startTime: string,
    endTime: string,
    status = "scheduled"
  ): BusyAppointment => ({ professionalId, startTime, endTime, status });

  it("todos os slots livres quando não há agendamentos", () => {
    const slots = freeSlotsForAnyone([{ id: 1 }], [], schedule, 60);
    expect(slots).toEqual(["08:00", "09:00"]);
  });

  it("remove slot quando o único profissional está ocupado nele", () => {
    const busy = [appt(1, "08:00", "09:00")];
    const slots = freeSlotsForAnyone([{ id: 1 }], busy, schedule, 60);
    expect(slots).toEqual(["09:00"]);
  });

  it("mantém slot se ALGUM profissional está livre (sem preferência)", () => {
    const busy = [appt(1, "08:00", "09:00")];
    const slots = freeSlotsForAnyone([{ id: 1 }, { id: 2 }], busy, schedule, 60);
    expect(slots).toEqual(["08:00", "09:00"]);
  });

  it("remove slot quando a duração invade um agendamento ocupado", () => {
    // serviço de 90min: slot 08:00 ocupa 08:00-09:30 → conflita com 09:00-10:00
    const busy = [appt(1, "09:00", "10:00")];
    const slots = freeSlotsForAnyone([{ id: 1 }], busy, schedule, 90);
    expect(slots).toEqual([]);
  });

  it("retorna vazio sem profissionais", () => {
    expect(freeSlotsForAnyone([], [], schedule, 60)).toEqual([]);
  });
});
