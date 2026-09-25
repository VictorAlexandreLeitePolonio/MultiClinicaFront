import { beforeEach, expect, test, vi } from "vitest";
import api from "@/lib/api";
import { createAppointment, getAppointmentProfessionals, getProfessionalDaySchedule } from "./appointments.service";

vi.mock("@/lib/api", () => ({ default: { get: vi.fn(), post: vi.fn() } }));

beforeEach(() => vi.clearAllMocks());

test("carrega profissionais e agenda filtrada", async () => {
  vi.mocked(api.get).mockResolvedValue({ data: [] });
  await getAppointmentProfessionals();
  await getProfessionalDaySchedule(7, "2026-09-28");
  expect(api.get).toHaveBeenCalledWith("/api/appointments/professionals");
  expect(api.get).toHaveBeenCalledWith("/api/appointments/day-schedule", {
    params: { professionalId: 7, date: "2026-09-28" },
  });
});

test("envia profissional e hora local sem conversão do navegador", async () => {
  vi.mocked(api.post).mockResolvedValue({ data: { id: 1 } });
  await createAppointment({ patientId: 3, professionalId: 7, appointmentDate: "2026-09-28T13:30:00.000Z" });
  expect(api.post).toHaveBeenCalledWith("/api/appointments", {
    patientId: 3, professionalId: 7, appointmentDate: "2026-09-28T13:30:00.000Z",
  });
});
