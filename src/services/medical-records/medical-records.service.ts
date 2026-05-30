import api from "@/lib/api";
import { normalizePagedResult } from "@/lib/pagination";
import { MedicalRecord, PagedResult } from "@/types";

export interface GetMedicalRecordsParams {
  patientId?: number;
  patientName?: string;
  userId?: number;
  createdAt?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateMedicalRecordDto {
  patientId: number;
  titulo: string;
  patologia: string;
  queixaPrincipal: string;
  examesImagem?: string;
  doencaAntiga?: string;
  doencaAtual?: string;
  habitos?: string;
  examesFisicos?: string;
  sinaisVitais?: string;
  medicamentos?: string;
  cirurgias?: string;
  outrasDoencas?: string;
  sessao?: string;
  orientacaoDomiciliar?: string;
}

export interface UpdateMedicalRecordDto {
  titulo?: string;
  patologia?: string;
  queixaPrincipal?: string;
  examesImagem?: string;
  doencaAntiga?: string;
  doencaAtual?: string;
  habitos?: string;
  examesFisicos?: string;
  sinaisVitais?: string;
  medicamentos?: string;
  cirurgias?: string;
  outrasDoencas?: string;
  sessao?: string;
  orientacaoDomiciliar?: string;
}

export async function getMedicalRecords(
  params?: GetMedicalRecordsParams
): Promise<PagedResult<MedicalRecord>> {
  const response = await api.get<PagedResult<MedicalRecord> | MedicalRecord[]>("/api/medicalrecords", {
    params,
  });

  return normalizePagedResult<MedicalRecord>(response.data, params?.pageSize);
}

export async function getMedicalRecordById(id: number): Promise<MedicalRecord> {
  const response = await api.get<MedicalRecord>(`/api/medicalrecords/${id}`);

  return response.data;
}

export async function createMedicalRecord(
  payload: CreateMedicalRecordDto
): Promise<MedicalRecord> {
  const response = await api.post<MedicalRecord>("/api/medicalrecords", payload);

  return response.data;
}

export async function updateMedicalRecord(
  id: number,
  payload: UpdateMedicalRecordDto
): Promise<MedicalRecord> {
  const response = await api.put<MedicalRecord>(`/api/medicalrecords/${id}`, payload);

  return response.data;
}

export async function deleteMedicalRecord(id: number): Promise<void> {
  await api.delete(`/api/medicalrecords/${id}`);
}
