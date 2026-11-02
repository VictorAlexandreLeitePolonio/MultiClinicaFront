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
} from "@/types/evolution";

export interface GetEvolutionTemplatesParams {
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

export async function getEvolutionDashboardSummary(): Promise<EvolutionDashboardSummary> {
  const response = await api.get<EvolutionDashboardSummary>("/api/dashboard/evolution-summary");
  return response.data;
}
