import { expect, test } from "vitest";
import { clinicDateTimeToIso } from "./clinicDateTime";

test("mantém appointmentDate em ISO UTC para 10:30 no Brasil", () => {
  expect(clinicDateTimeToIso("2026-09-28T10:30", "America/Sao_Paulo"))
    .toBe("2026-09-28T13:30:00.000Z");
});

test("recusa horário local inexistente ou ambíguo", () => {
  expect(() => clinicDateTimeToIso("2026-03-08T02:30", "America/New_York")).toThrow();
  expect(() => clinicDateTimeToIso("2026-11-01T01:30", "America/New_York")).toThrow();
});
