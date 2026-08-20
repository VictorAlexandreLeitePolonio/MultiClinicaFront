import api from "@/lib/api";
import { BusinessHour, ClinicCategory, CreateBusinessHourRequest } from "@/types";

// ── Categorias ───────────────────────────────────────────────────────────────

export async function getCategoryCatalog(): Promise<ClinicCategory[]> {
  const response = await api.get<ClinicCategory[]>("/api/clinic/categories/catalog");
  return response.data;
}

export async function getClinicCategories(): Promise<ClinicCategory[]> {
  const response = await api.get<ClinicCategory[]>("/api/clinic/categories");
  return response.data;
}

export async function setClinicCategories(categoryIds: number[]): Promise<ClinicCategory[]> {
  const response = await api.put<ClinicCategory[]>("/api/clinic/categories", { categoryIds });
  return response.data;
}

// ── Horários ─────────────────────────────────────────────────────────────────

export async function getBusinessHours(): Promise<BusinessHour[]> {
  const response = await api.get<BusinessHour[]>("/api/clinic/business-hours");
  return response.data;
}

export async function addBusinessHour(payload: CreateBusinessHourRequest): Promise<BusinessHour> {
  const response = await api.post<BusinessHour>("/api/clinic/business-hours", payload);
  return response.data;
}

export async function deleteBusinessHour(id: number): Promise<void> {
  await api.delete(`/api/clinic/business-hours/${id}`);
}
