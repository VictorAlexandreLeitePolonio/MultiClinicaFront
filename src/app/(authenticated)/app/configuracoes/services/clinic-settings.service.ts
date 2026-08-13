import api from "@/lib/api";
import { ClinicSettings, UpdateClinicSettingsRequest } from "@/types";

export async function getClinicSettings(): Promise<ClinicSettings> {
  const response = await api.get<ClinicSettings>("/api/clinic/settings");
  return response.data;
}

export async function updateClinicSettings(
  payload: UpdateClinicSettingsRequest,
): Promise<ClinicSettings> {
  const response = await api.put<ClinicSettings>("/api/clinic/settings", payload);
  return response.data;
}
