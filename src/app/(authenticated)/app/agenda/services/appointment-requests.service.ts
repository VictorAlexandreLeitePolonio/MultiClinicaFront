import api from "@/lib/api";
import { AppointmentRequest } from "@/types";

export async function getClinicRequests(): Promise<AppointmentRequest[]> {
  const response = await api.get<AppointmentRequest[]>("/api/appointment-requests");
  return response.data;
}

export async function getClinicRequest(id: number): Promise<AppointmentRequest> {
  const response = await api.get<AppointmentRequest>(`/api/appointment-requests/${id}`);
  return response.data;
}

export async function acceptRequest(id: number, professionalId: number): Promise<AppointmentRequest> {
  const response = await api.patch<AppointmentRequest>(`/api/appointment-requests/${id}/accept`, {
    professionalId,
  });
  return response.data;
}

export async function rejectRequest(id: number, reason: string): Promise<AppointmentRequest> {
  const response = await api.patch<AppointmentRequest>(`/api/appointment-requests/${id}/reject`, { reason });
  return response.data;
}

export async function cancelRequestByClinic(id: number, reason: string): Promise<AppointmentRequest> {
  const response = await api.patch<AppointmentRequest>(`/api/appointment-requests/${id}/cancel`, { reason });
  return response.data;
}
