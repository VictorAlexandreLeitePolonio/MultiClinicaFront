import { describe, expect, it } from "vitest";
import { appointmentRequestSchema, dateTimeLocalToIso } from "./appointment-request.schema";

function localInput(offsetDays: number): string {
  const d = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

describe("appointmentRequestSchema", () => {
  it("aceita data futura com motivo", () => {
    const result = appointmentRequestSchema.safeParse({
      requestedDate: localInput(2),
      reason: "Avaliação inicial",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita data no passado", () => {
    const result = appointmentRequestSchema.safeParse({
      requestedDate: localInput(-2),
      reason: "Avaliação inicial",
    });
    expect(result.success).toBe(false);
  });

  it("exige motivo", () => {
    const result = appointmentRequestSchema.safeParse({
      requestedDate: localInput(2),
      reason: "",
    });
    expect(result.success).toBe(false);
  });

  it("dateTimeLocalToIso converte para ISO válido", () => {
    const iso = dateTimeLocalToIso("2026-08-25T14:30");
    expect(new Date(iso).getMinutes()).toBe(30);
  });
});
