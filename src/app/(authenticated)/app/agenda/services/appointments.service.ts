import api from "@/lib/api";
import { normalizePagedResult } from "@/lib/pagination";
import { Appointment, PagedResult } from "@/types";

export interface AppointmentProfessional { id: number; name: string }
export interface DayAppointment { id: number; patientName: string; start: string; end: string }
export interface DaySlot { start: string; end: string; available: boolean }
export interface ProfessionalDaySchedule {
  date: string;
  timeZoneId: string;
  durationMinutes: number;
  appointments: DayAppointment[];
  slots: DaySlot[];
}

export interface CreateAppointmentPayload {
  patientId: number;
  professionalId: number;
  appointmentDate: string;
}

export interface UpdateAppointmentPayload {
  appointmentDate: string;
  status: "Scheduled" | "Completed" | "Cancelled";
}

export async function getAppointmentProfessionals(): Promise<AppointmentProfessional[]> {
  const response = await api.get<AppointmentProfessional[]>("/api/appointments/professionals");
  return response.data;
}

export async function getProfessionalDaySchedule(professionalId: number, date: string): Promise<ProfessionalDaySchedule> {
  const response = await api.get<ProfessionalDaySchedule>("/api/appointments/day-schedule", {
    params: { professionalId, date },
  });
  return response.data;
}

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

export async function createAppointment(payload: CreateAppointmentPayload): Promise<Appointment> {
  const response = await api.post<Appointment>("/api/appointments", payload);

  return response.data;
}

export async function updateAppointment(
  id: number,
  payload: UpdateAppointmentPayload
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
