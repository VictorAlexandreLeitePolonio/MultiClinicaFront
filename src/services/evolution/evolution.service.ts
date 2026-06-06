import api from "@/lib/api";
import { normalizePagedResult } from "@/lib/pagination";
import {
  EvolutionDashboardSummary,
  EvolutionTemplate,
  EvolutionTemplateField,
  EvolutionTemplateFieldPayload,
  EvolutionTemplateFieldUpdatePayload,
  EvolutionTemplatePayload,
  EvolutionTemplatesResult,
  EvolutionTemplateUpdatePayload,
  PatientEvolution,
  PatientEvolutionsResult,
  PatientEvolutionPayload,
  PatientEvolutionUpdatePayload,
  PatientTreatment,
  PatientTreatmentPayload,
  PatientTreatmentUpdatePayload,
  TreatmentProgressResponse,
} from "@/types/evolution";

export interface GetEvolutionTemplatesParams {
  page?: number;
  pageSize?: number;
}

export interface GetPatientEvolutionsParams {
  page?: number;
  pageSize?: number;
}

export async function getEvolutionTemplates(
  params?: GetEvolutionTemplatesParams,
): Promise<EvolutionTemplatesResult> {
  const response = await api.get<EvolutionTemplatesResult | EvolutionTemplate[]>("/api/evolution-templates", {
    params,
  });

  return normalizePagedResult<EvolutionTemplate>(response.data, params?.pageSize);
}

export async function createEvolutionTemplate(
  payload: EvolutionTemplatePayload,
): Promise<EvolutionTemplate> {
  const response = await api.post<EvolutionTemplate>("/api/evolution-templates", payload);
  return response.data;
}

export async function getEvolutionTemplateById(id: number): Promise<EvolutionTemplate> {
  const response = await api.get<EvolutionTemplate>(`/api/evolution-templates/${id}`);
  return response.data;
}

export async function updateEvolutionTemplate(
  id: number,
  payload: EvolutionTemplateUpdatePayload,
): Promise<void> {
  await api.patch(`/api/evolution-templates/${id}`, payload);
}

export async function deleteEvolutionTemplate(id: number): Promise<void> {
  await api.delete(`/api/evolution-templates/${id}`);
}

export async function getEvolutionTemplateFields(templateId: number): Promise<EvolutionTemplateField[]> {
  const response = await api.get<EvolutionTemplateField[]>(`/api/evolution-templates/${templateId}/fields`);
  return response.data;
}

export async function createEvolutionTemplateField(
  templateId: number,
  payload: EvolutionTemplateFieldPayload,
): Promise<EvolutionTemplateField> {
  const response = await api.post<EvolutionTemplateField>(
    `/api/evolution-templates/${templateId}/fields`,
    payload,
  );
  return response.data;
}

export async function updateEvolutionTemplateField(
  fieldId: number,
  payload: EvolutionTemplateFieldUpdatePayload,
): Promise<void> {
  await api.patch(`/api/evolution-template-fields/${fieldId}`, payload);
}

export async function deleteEvolutionTemplateField(fieldId: number): Promise<void> {
  await api.delete(`/api/evolution-template-fields/${fieldId}`);
}

export async function getPatientTreatments(patientId: number): Promise<PatientTreatment[]> {
  const response = await api.get<PatientTreatment[]>(`/api/patients/${patientId}/treatments`);
  return response.data;
}

export async function createPatientTreatment(
  patientId: number,
  payload: PatientTreatmentPayload,
): Promise<PatientTreatment> {
  const response = await api.post<PatientTreatment>(`/api/patients/${patientId}/treatments`, payload);
  return response.data;
}

export async function getPatientTreatment(
  patientId: number,
  treatmentId: number,
): Promise<PatientTreatment> {
  const response = await api.get<PatientTreatment>(`/api/patients/${patientId}/treatments/${treatmentId}`);
  return response.data;
}

export async function updatePatientTreatment(
  patientId: number,
  treatmentId: number,
  payload: PatientTreatmentUpdatePayload,
): Promise<void> {
  await api.patch(`/api/patients/${patientId}/treatments/${treatmentId}`, payload);
}

export async function getPatientEvolutions(
  patientId: number,
  treatmentId: number,
  params?: GetPatientEvolutionsParams,
): Promise<PatientEvolutionsResult> {
  const response = await api.get<PatientEvolutionsResult | PatientEvolution[]>(
    `/api/patients/${patientId}/treatments/${treatmentId}/evolutions`,
    { params },
  );

  return normalizePagedResult<PatientEvolution>(response.data, params?.pageSize);
}

export async function createPatientEvolution(
  patientId: number,
  treatmentId: number,
  payload: PatientEvolutionPayload,
): Promise<PatientEvolution> {
  const response = await api.post<PatientEvolution>(
    `/api/patients/${patientId}/treatments/${treatmentId}/evolutions`,
    payload,
  );
  return response.data;
}

export async function getPatientEvolution(
  patientId: number,
  treatmentId: number,
  evolutionId: number,
): Promise<PatientEvolution> {
  const response = await api.get<PatientEvolution>(
    `/api/patients/${patientId}/treatments/${treatmentId}/evolutions/${evolutionId}`,
  );
  return response.data;
}

export async function updatePatientEvolution(
  patientId: number,
  treatmentId: number,
  evolutionId: number,
  payload: PatientEvolutionUpdatePayload,
): Promise<void> {
  await api.patch(`/api/patients/${patientId}/treatments/${treatmentId}/evolutions/${evolutionId}`, payload);
}

export async function deletePatientEvolution(
  patientId: number,
  treatmentId: number,
  evolutionId: number,
): Promise<void> {
  await api.delete(`/api/patients/${patientId}/treatments/${treatmentId}/evolutions/${evolutionId}`);
}

export async function getTreatmentProgress(
  patientId: number,
  treatmentId: number,
): Promise<TreatmentProgressResponse> {
  const response = await api.get<TreatmentProgressResponse>(
    `/api/patients/${patientId}/treatments/${treatmentId}/progress`,
  );
  return response.data;
}

export async function getEvolutionDashboardSummary(): Promise<EvolutionDashboardSummary> {
  const response = await api.get<EvolutionDashboardSummary>("/api/dashboard/evolution-summary");
  return response.data;
}
