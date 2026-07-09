import api from "@/lib/api";
import { normalizePagedResult } from "@/lib/pagination";
import { CategoriaFinanceira, PagedResult, TipoCategoriaFinanceira } from "@/types";
import { CategoriaFinanceiraFormData } from "@/app/(authenticated)/app/financeiro/configuracoes/schemas/categoriaFinanceira.schema";

export interface GetCategoriasFinanceirasParams {
  nome?: string;
  tipo?: TipoCategoriaFinanceira;
  page?: number;
  pageSize?: number;
}

export async function getCategoriasFinanceiras(
  params?: GetCategoriasFinanceirasParams
): Promise<PagedResult<CategoriaFinanceira>> {
  const response = await api.get<PagedResult<CategoriaFinanceira> | CategoriaFinanceira[]>(
    "/api/categorias-financeiras",
    { params }
  );

  return normalizePagedResult<CategoriaFinanceira>(response.data, params?.pageSize);
}

export async function createCategoriaFinanceira(
  payload: CategoriaFinanceiraFormData
): Promise<CategoriaFinanceira> {
  const response = await api.post<CategoriaFinanceira>("/api/categorias-financeiras", payload);

  return response.data;
}

export async function updateCategoriaFinanceira(
  id: number,
  payload: CategoriaFinanceiraFormData
): Promise<CategoriaFinanceira> {
  const response = await api.put<CategoriaFinanceira>(`/api/categorias-financeiras/${id}`, payload);

  return response.data;
}

export async function setCategoriaFinanceiraActive(id: number, active: boolean): Promise<CategoriaFinanceira> {
  const response = await api.post<CategoriaFinanceira>(
    `/api/categorias-financeiras/${id}/${active ? "reativar" : "inativar"}`
  );

  return response.data;
}
