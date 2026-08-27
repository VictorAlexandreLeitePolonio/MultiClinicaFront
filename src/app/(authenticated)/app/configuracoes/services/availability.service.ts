import api from "@/lib/api";
import { AvailabilitySettings, ProfessionalAvailabilityRange } from "../types/availability.types";

export async function getAvailabilitySettings(): Promise<AvailabilitySettings> {
  const response = await api.get<AvailabilitySettings>("/api/clinic/availability/settings");
  return response.data;
}

export async function updateAvailabilitySettings(payload: AvailabilitySettings): Promise<AvailabilitySettings> {
  const response = await api.put<AvailabilitySettings>("/api/clinic/availability/settings", payload);
  return response.data;
}

export async function getProfessionalAvailability(
  professionalId: number,
): Promise<ProfessionalAvailabilityRange[]> {
  const response = await api.get<ProfessionalAvailabilityRange[]>(
    `/api/clinic/availability/professionals/${professionalId}`,
  );
  return response.data;
}

export async function replaceProfessionalAvailability(
  professionalId: number,
  ranges: ProfessionalAvailabilityRange[],
): Promise<ProfessionalAvailabilityRange[]> {
  const response = await api.put<ProfessionalAvailabilityRange[]>(
    `/api/clinic/availability/professionals/${professionalId}`,
    ranges,
  );
  return response.data;
}
