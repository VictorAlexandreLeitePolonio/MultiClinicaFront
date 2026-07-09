import api from "@/lib/api";
import { normalizePagedResult } from "@/lib/pagination";
import { ContaFinanceira, PagedResult } from "@/types";
import { ContaFinanceiraFormData } from "@/app/(authenticated)/app/financeiro/configuracoes/schemas/contaFinanceira.schema";

export interface GetContasFinanceirasParams {
  nome?: string;
  page?: number;
  pageSize?: number;
}

export async function getContasFinanceiras(
  params?: GetContasFinanceirasParams
): Promise<PagedResult<ContaFinanceira>> {
  const response = await api.get<PagedResult<ContaFinanceira> | ContaFinanceira[]>("/api/contas-financeiras", {
    params,
  });

  return normalizePagedResult<ContaFinanceira>(response.data, params?.pageSize);
}

export async function createContaFinanceira(payload: ContaFinanceiraFormData): Promise<ContaFinanceira> {
  const response = await api.post<ContaFinanceira>("/api/contas-financeiras", payload);

  return response.data;
}

export async function updateContaFinanceira(
  id: number,
  payload: ContaFinanceiraFormData
): Promise<ContaFinanceira> {
  const response = await api.put<ContaFinanceira>(`/api/contas-financeiras/${id}`, payload);

  return response.data;
}

export async function setContaFinanceiraActive(id: number, active: boolean): Promise<ContaFinanceira> {
  const response = await api.post<ContaFinanceira>(
    `/api/contas-financeiras/${id}/${active ? "reativar" : "inativar"}`
  );

  return response.data;
}
