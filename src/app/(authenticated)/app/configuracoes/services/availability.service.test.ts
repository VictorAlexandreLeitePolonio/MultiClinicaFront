import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/lib/api";
import { getAvailabilitySettings, replaceProfessionalAvailability } from "./availability.service";

vi.mock("@/lib/api", () => ({ default: { get: vi.fn(), put: vi.fn() } }));

describe("availability service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses the exact settings route", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { slotDurationMinutes: 60, timeZoneId: "UTC" } });
    await getAvailabilitySettings();
    expect(api.get).toHaveBeenCalledWith("/api/clinic/availability/settings");
  });

  it("fully replaces a professional schedule", async () => {
    vi.mocked(api.put).mockResolvedValue({ data: [] });
    await replaceProfessionalAvailability(7, []);
    expect(api.put).toHaveBeenCalledWith("/api/clinic/availability/professionals/7", []);
  });
});
