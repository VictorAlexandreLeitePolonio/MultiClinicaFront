import api from "@/lib/api";
import { normalizePagedResult } from "@/lib/pagination";
import { ContaReceber, PagedResult, StatusContaReceber } from "@/types";
import { CreateContaReceberFormData } from "@/app/(authenticated)/app/financeiro/contas-a-receber/schemas/contaReceber.schema";

export interface GetContasReceberParams {
  pacienteId?: number;
  status?: StatusContaReceber;
  page?: number;
  pageSize?: number;
}

export async function getContasReceber(params?: GetContasReceberParams): Promise<PagedResult<ContaReceber>> {
  const response = await api.get<PagedResult<ContaReceber> | ContaReceber[]>("/api/contas-receber", {
    params,
  });

  return normalizePagedResult<ContaReceber>(response.data, params?.pageSize);
}

export async function getContaReceberById(id: number): Promise<ContaReceber> {
  const response = await api.get<ContaReceber>(`/api/contas-receber/${id}`);

  return response.data;
}

export async function createContaReceber(payload: CreateContaReceberFormData): Promise<ContaReceber> {
  const response = await api.post<ContaReceber>("/api/contas-receber", {
    ...payload,
    origem: "Manual",
  });

  return response.data;
}

export async function cancelarContaReceber(id: number, motivo: string): Promise<ContaReceber> {
  const response = await api.post<ContaReceber>(`/api/contas-receber/${id}/cancelar`, { motivo });

  return response.data;
}
