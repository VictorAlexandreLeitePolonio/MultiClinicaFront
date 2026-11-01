import api from "@/lib/api";
import { normalizePagedResult } from "@/lib/pagination";
import {
  PatientEvolution,
  PatientEvolutionPayload,
  PatientEvolutionUpdatePayload,
  PatientEvolutionsResult,
  PatientMeasurementSeries,
  PatientTimeline,
} from "@/types/evolution";

// Prontuário do paciente: evoluções (sem acompanhamento), medições por ficha e linha do tempo.
const base = (patientId: number) => `/api/patients/${patientId}`;

export interface PatientEvolutionsParams {
  appointmentId?: number;
  page?: number;
  pageSize?: number;
}

export async function getPatientEvolutions(
  patientId: number,
  params?: PatientEvolutionsParams
): Promise<PatientEvolutionsResult> {
  const response = await api.get(`${base(patientId)}/evolutions`, { params });
  return normalizePagedResult<PatientEvolution>(response.data);
}

export async function getPatientEvolution(patientId: number, evolutionId: number): Promise<PatientEvolution> {
  const response = await api.get<PatientEvolution>(`${base(patientId)}/evolutions/${evolutionId}`);
  return response.data;
}

export async function createPatientEvolution(
  patientId: number,
  payload: PatientEvolutionPayload
): Promise<PatientEvolution> {
  const response = await api.post<PatientEvolution>(`${base(patientId)}/evolutions`, payload);
  return response.data;
}

export async function updatePatientEvolution(
  patientId: number,
  evolutionId: number,
  payload: PatientEvolutionUpdatePayload
): Promise<void> {
  await api.patch(`${base(patientId)}/evolutions/${evolutionId}`, payload);
}

export async function deletePatientEvolution(patientId: number, evolutionId: number): Promise<void> {
  await api.delete(`${base(patientId)}/evolutions/${evolutionId}`);
}

export async function getPatientMeasurements(patientId: number): Promise<PatientMeasurementSeries[]> {
  const response = await api.get<PatientMeasurementSeries[]>(`${base(patientId)}/measurements`);
  return response.data;
}

export async function getPatientTimeline(patientId: number, before?: string | null): Promise<PatientTimeline> {
  const response = await api.get<PatientTimeline>(`${base(patientId)}/timeline`, {
    params: { before: before ?? undefined, take: 30 },
  });
  return response.data;
}
