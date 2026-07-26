import api from "@/lib/api";
import { normalizePagedResult } from "@/lib/pagination";
import { PagedResult, Plan } from "@/types";
import { PlanoFormData } from "@/app/(authenticated)/app/planos/schemas/plano.schema";

export interface GetPlansParams {
  name?: string;
  page?: number;
  pageSize?: number;
}

export async function getPlans(params?: GetPlansParams): Promise<PagedResult<Plan>> {
  const response = await api.get<PagedResult<Plan> | Plan[]>("/api/plans", {
    params,
  });

  return normalizePagedResult<Plan>(response.data, params?.pageSize);
}

export async function getPlanById(id: number): Promise<Plan> {
  const response = await api.get<Plan>(`/api/plans/${id}`);

  return response.data;
}

export async function createPlan(payload: PlanoFormData): Promise<Plan> {
  const response = await api.post<Plan>("/api/plans", payload);

  return response.data;
}

export async function updatePlan(id: number, payload: PlanoFormData): Promise<Plan> {
  const response = await api.put<Plan>(`/api/plans/${id}`, payload);

  return response.data;
}

export async function deletePlan(id: number): Promise<void> {
  await api.delete(`/api/plans/${id}`);
}
