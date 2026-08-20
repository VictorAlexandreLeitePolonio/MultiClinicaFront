import api from "@/lib/api";
import { ClinicMedia, ClinicMediaType } from "@/types";

export async function getClinicMedia(): Promise<ClinicMedia[]> {
  const response = await api.get<ClinicMedia[]>("/api/clinic/media");
  return response.data;
}

export async function uploadClinicMedia(
  type: ClinicMediaType,
  file: File,
  sortOrder?: number,
): Promise<ClinicMedia> {
  const form = new FormData();
  form.append("type", type);
  if (sortOrder !== undefined) form.append("sortOrder", String(sortOrder));
  form.append("file", file);

  const response = await api.post<ClinicMedia>("/api/clinic/media", form);
  return response.data;
}

export async function reorderClinicMedia(id: number, sortOrder: number): Promise<ClinicMedia> {
  const response = await api.patch<ClinicMedia>(`/api/clinic/media/${id}/order`, { sortOrder });
  return response.data;
}

export async function deleteClinicMedia(id: number): Promise<void> {
  await api.delete(`/api/clinic/media/${id}`);
}
