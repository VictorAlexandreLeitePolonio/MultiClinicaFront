import api from "@/lib/api";
import { normalizePagedResult } from "@/lib/pagination";
import type { PagedResult } from "@/types";

export interface CategoriaProduto {
  id: number;
  nome: string;
  isActive: boolean;
  createdAt: string;
}

export interface GetCategoriasProdutoParams { nome?: string; page: number; pageSize: number; }
export interface CategoriaProdutoPayload { nome: string; }

export async function getCategoriasProduto(params: GetCategoriasProdutoParams): Promise<PagedResult<CategoriaProduto>> {
  const response = await api.get<PagedResult<CategoriaProduto> | CategoriaProduto[]>("/api/categorias-produto", { params });
  return normalizePagedResult<CategoriaProduto>(response.data, params.pageSize);
}
export async function createCategoriaProduto(payload: CategoriaProdutoPayload): Promise<CategoriaProduto> {
  const response = await api.post<CategoriaProduto>("/api/categorias-produto", payload); return response.data;
}
export async function updateCategoriaProduto(id: number, payload: CategoriaProdutoPayload): Promise<CategoriaProduto> {
  const response = await api.put<CategoriaProduto>(`/api/categorias-produto/${id}`, payload); return response.data;
}
export async function setCategoriaProdutoActive(id: number, active: boolean): Promise<CategoriaProduto> {
  const response = await api.post<CategoriaProduto>(`/api/categorias-produto/${id}/${active ? "reativar" : "inativar"}`); return response.data;
}
