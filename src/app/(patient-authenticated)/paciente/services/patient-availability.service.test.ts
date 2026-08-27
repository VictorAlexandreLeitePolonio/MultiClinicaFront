import { describe, expect, it, vi } from "vitest";
import patientApi from "@/lib/patientApi";
import { getClinicAvailability } from "./patient-portal.service";

vi.mock("@/lib/patientApi", () => ({ default: { get: vi.fn() } }));

describe("patient clinic availability", () => {
  it("uses the clinic availability route and local date query", async () => {
    vi.mocked(patientApi.get).mockResolvedValue({ data: { slots: [] } });
    await getClinicAvailability(12, "2026-08-26");
    expect(patientApi.get).toHaveBeenCalledWith(
      "/api/patient/marketplace/clinics/12/availability",
      { params: { date: "2026-08-26" } },
    );
  });
});
