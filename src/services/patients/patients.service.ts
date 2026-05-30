import api from "@/lib/api";
import { normalizePagedResult } from "@/lib/pagination";
import { PagedResult, Patient, PatientProfile } from "@/types";

export interface GetPatientsParams {
  name?: string;
  appointmentStatus?: string;
  paymentStatus?: string;
  page?: number;
  pageSize?: number;
}

export interface PatientPayload {
  name: string | null;
  email: string | null;
  cpf: string | null;
  rg: string | null;
  phone: string | null;
  rua: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
}

export interface ChangePatientStatusResponse {
  id: number;
  isActive: boolean;
}

export async function getPatients(params?: GetPatientsParams): Promise<PagedResult<Patient>> {
  const response = await api.get<PagedResult<Patient> | Patient[]>("/api/patients", {
    params,
  });

  return normalizePagedResult<Patient>(response.data, params?.pageSize);
}

export async function getPatientById(id: number): Promise<Patient> {
  const response = await api.get<Patient>(`/api/patients/${id}`);

  return response.data;
}

export async function getPatientProfile(id: number): Promise<PatientProfile> {
  const response = await api.get<PatientProfile>(`/api/patients/${id}/profile`);

  return response.data;
}

export async function createPatient(payload: PatientPayload): Promise<Patient> {
  const response = await api.post<Patient>("/api/patients", payload);

  return response.data;
}

export async function updatePatient(id: number, payload: PatientPayload): Promise<Patient> {
  const response = await api.put<Patient>(`/api/patients/${id}`, payload);

  return response.data;
}

export async function deletePatient(id: number): Promise<void> {
  await api.delete(`/api/patients/${id}`);
}

export async function changePatientStatus(id: number): Promise<ChangePatientStatusResponse> {
  const response = await api.patch<ChangePatientStatusResponse>(`/api/patients/${id}/status`);

  return response.data;
}
