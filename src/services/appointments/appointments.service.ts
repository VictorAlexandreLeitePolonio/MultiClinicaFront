import api from "@/lib/api";
import { normalizePagedResult } from "@/lib/pagination";
import { Appointment, PagedResult } from "@/types";
import { AgendaFormData } from "@/app/(authenticated)/app/agenda/schemas/agenda.schema";

export interface GetAppointmentsParams {
  patientName?: string;
  status?: string;
  patientId?: number;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export async function getAppointments(params?: GetAppointmentsParams): Promise<PagedResult<Appointment>> {
  const response = await api.get<PagedResult<Appointment> | Appointment[]>("/api/appointments", {
    params,
  });

  return normalizePagedResult<Appointment>(response.data);
}

export interface ChangeAppointmentStatusPayload {
  status: "Scheduled" | "Completed" | "Cancelled";
}

export interface ChangeAppointmentStatusResponse {
  id: number;
  status: string;
}

export async function getAppointmentById(id: number): Promise<Appointment> {
  const response = await api.get<Appointment>(`/api/appointments/${id}`);

  return response.data;
}

export async function createAppointment(payload: AgendaFormData): Promise<Appointment> {
  const response = await api.post<Appointment>("/api/appointments", payload);

  return response.data;
}

export async function updateAppointment(
  id: number,
  payload: AgendaFormData
): Promise<Appointment> {
  const response = await api.put<Appointment>(`/api/appointments/${id}`, payload);

  return response.data;
}

export async function deleteAppointment(id: number): Promise<void> {
  await api.delete(`/api/appointments/${id}`);
}

export async function changeAppointmentStatus(
  id: number,
  payload: ChangeAppointmentStatusPayload
): Promise<ChangeAppointmentStatusResponse> {
  const response = await api.patch<ChangeAppointmentStatusResponse>(
    `/api/appointments/${id}/status`,
    payload
  );

  return response.data;
}
