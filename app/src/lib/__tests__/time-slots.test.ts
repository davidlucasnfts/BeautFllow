import { describe, it, expect } from "vitest";
import {
  generateTimeSlots,
  floorToSlot,
  filterAvailableSlots,
} from "../time-slots";

describe("generateTimeSlots", () => {
  it("gera slots de 30 em 30 minutos", () => {
    const slots = generateTimeSlots("13:00", "15:00", 30);
    expect(slots).toEqual(["13:00", "13:30", "14:00", "14:30"]);
  });

  it("padrão do projeto: começa 07:00 e termina antes das 21:00", () => {
    const slots = generateTimeSlots();
    expect(slots[0]).toBe("07:00");
    expect(slots[slots.length - 1]).toBe("20:30");
    expect(slots).toHaveLength(28);
  });
});

describe("floorToSlot", () => {
  it("arredonda para baixo no slot de 30 min", () => {
    expect(floorToSlot("13:45")).toBe("13:30");
    expect(floorToSlot("13:10")).toBe("13:00");
    expect(floorToSlot("13:30")).toBe("13:30");
  });
});

describe("filterAvailableSlots", () => {
  it("remove horários que colidem com atendimento ocupado", () => {
    const slots = generateTimeSlots("13:00", "15:00", 30);
    const available = filterAvailableSlots(
      slots,
      [{ start: "13:30", end: "14:30" }], // atendimento de 1h
      30
    );
    expect(available).toEqual(["13:00", "14:30"]);
  });

  it("considera a duração do serviço (1h ocupa 2 slots)", () => {
    const slots = generateTimeSlots("13:00", "15:00", 30);
    const available = filterAvailableSlots(
      slots,
      [],
      60
    );
    // 14:30 + 1h = 15:30 passa do fim do expediente → fica fora da grade já
    expect(available).toEqual(slots);
  });

  it("serviço de 1h não pode começar às 14:30 se algo ocupa 14:00-15:00", () => {
    const slots = generateTimeSlots("13:00", "16:00", 30);
    const available = filterAvailableSlots(
      slots,
      [{ start: "14:00", end: "15:00" }],
      60
    );
    expect(available).not.toContain("14:00");
    expect(available).not.toContain("14:30");
    expect(available).not.toContain("13:30"); // 13:30+1h colidiria com 14:00
    expect(available).toContain("13:00");
    expect(available).toContain("15:00");
  });
});
