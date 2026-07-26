import api from "@/lib/api";
import { normalizePagedResult } from "@/lib/pagination";
import type { PagedResult } from "@/types";

export interface Fornecedor {
  id: number;
  nome: string;
  isActive: boolean;
  createdAt: string;
}

export interface GetFornecedoresParams {
  nome?: string;
  page: number;
  pageSize: number;
}

export interface FornecedorPayload {
  nome: string;
}

export async function getFornecedores(
  params: GetFornecedoresParams,
): Promise<PagedResult<Fornecedor>> {
  const response = await api.get<PagedResult<Fornecedor> | Fornecedor[]>(
    "/api/fornecedores",
    { params },
  );

  return normalizePagedResult<Fornecedor>(response.data, params.pageSize);
}

export async function createFornecedor(payload: FornecedorPayload): Promise<Fornecedor> {
  const response = await api.post<Fornecedor>("/api/fornecedores", payload);

  return response.data;
}

export async function updateFornecedor(
  id: number,
  payload: FornecedorPayload,
): Promise<Fornecedor> {
  const response = await api.put<Fornecedor>(`/api/fornecedores/${id}`, payload);

  return response.data;
}

export async function setFornecedorActive(id: number, active: boolean): Promise<void> {
  await api.post(`/api/fornecedores/${id}/${active ? "reativar" : "inativar"}`);
}
