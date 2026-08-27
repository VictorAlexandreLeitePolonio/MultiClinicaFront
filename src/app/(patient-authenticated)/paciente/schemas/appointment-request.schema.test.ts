import { describe, expect, it } from "vitest";
import { appointmentRequestSchema, formatSlotTime } from "./appointment-request.schema";

describe("appointmentRequestSchema", () => {
  it("accepts a backend slot and an empty optional reason", () => {
    const result = appointmentRequestSchema.safeParse({
      date: "2026-08-26",
      requestedDate: "2026-08-26T10:00:00-03:00",
      reason: "",
    });
    expect(result.success).toBe(true);
  });

  it("requires a selected backend slot", () => {
    expect(appointmentRequestSchema.safeParse({ date: "2026-08-26", requestedDate: "", reason: "" }).success)
      .toBe(false);
  });

  it("formats the offset string without browser timezone conversion", () => {
    expect(formatSlotTime("2026-08-26T10:30:00-03:00")).toBe("10:30");
  });
});
