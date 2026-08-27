import { describe, expect, it } from "vitest";
import { availabilitySettingsSchema, professionalAvailabilitySchema } from "./availability.schema";

describe("availability schemas", () => {
  it("accepts any five-minute duration between 15 and 240", () => {
    expect(availabilitySettingsSchema.safeParse({ slotDurationMinutes: 35, timeZoneId: "UTC" }).success).toBe(true);
    expect(availabilitySettingsSchema.safeParse({ slotDurationMinutes: 17, timeZoneId: "UTC" }).success).toBe(false);
  });

  it("rejects overlapping ranges on the same day", () => {
    const result = professionalAvailabilitySchema.safeParse([
      { dayOfWeek: "Monday", startTime: "08:00:00", endTime: "12:00:00" },
      { dayOfWeek: "Monday", startTime: "11:00:00", endTime: "13:00:00" },
    ]);
    expect(result.success).toBe(false);
  });
});
