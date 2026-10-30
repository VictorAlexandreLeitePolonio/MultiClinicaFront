import { describe, expect, it, vi } from "vitest";
import patientApi from "@/lib/patientApi";
import { getMyCharges } from "./patient-charges.service";

vi.mock("@/lib/patientApi", () => ({ default: { get: vi.fn() } }));

describe("patient charges service", () => {
  it("busca as cobranças do paciente autenticado", async () => {
    vi.mocked(patientApi.get).mockResolvedValue({ data: [] });

    await getMyCharges();

    expect(patientApi.get).toHaveBeenCalledWith("/api/patient/payments");
  });
});
