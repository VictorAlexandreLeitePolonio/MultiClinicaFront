import api from "@/lib/api";
import { ClinicSettings, UpdateClinicSettingsRequest } from "@/types";

export async function getSuperAdminClinicSettings(clinicId: number): Promise<ClinicSettings> {
  const response = await api.get<ClinicSettings>(
    `/api/superadmin/clinics/${clinicId}/settings`,
  );
  return response.data;
}

export async function updateSuperAdminClinicSettings(
  clinicId: number,
  payload: UpdateClinicSettingsRequest,
): Promise<ClinicSettings> {
  const response = await api.put<ClinicSettings>(
    `/api/superadmin/clinics/${clinicId}/settings`,
    payload,
  );
  return response.data;
}
