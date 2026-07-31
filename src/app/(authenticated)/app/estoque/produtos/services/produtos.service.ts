import api from "@/lib/api";
import { normalizePagedResult } from "@/lib/pagination";
import type { PagedResult } from "@/types";

export interface Produto {
  id: number;
  categoriaProdutoId: number | null;
  nome: string;
  descricao: string | null;
  codigoInterno: string | null;
  codigoBarras: string | null;
  valorCompra: number | null;
  valorVenda: number | null;
  quantidadeAtual: number;
  quantidadeMinima: number;
  isActive: boolean;
  createdAt: string;
}

export interface GetProdutosParams {
  nome?: string;
  categoriaProdutoId?: number;
  ativo?: boolean;
  page: number;
  pageSize: number;
}

export interface ProdutoPayload {
  categoriaProdutoId?: number | null;
  nome: string;
  descricao?: string | null;
  codigoInterno?: string | null;
  codigoBarras?: string | null;
  valorCompra: number;
  valorVenda: number;
  quantidadeMinima: number;
}

export async function getProdutos(params: GetProdutosParams): Promise<PagedResult<Produto>> {
  const response = await api.get<PagedResult<Produto> | Produto[]>("/api/produtos", { params });
  return normalizePagedResult<Produto>(response.data, params.pageSize);
}

export async function getProduto(id: number): Promise<Produto> {
  const response = await api.get<Produto>(`/api/produtos/${id}`);
  return response.data;
}

export async function createProduto(payload: ProdutoPayload): Promise<Produto> {
  const response = await api.post<Produto>("/api/produtos", payload);
  return response.data;
}

export async function updateProduto(id: number, payload: ProdutoPayload): Promise<Produto> {
  const response = await api.put<Produto>(`/api/produtos/${id}`, payload);
  return response.data;
}

export async function setProdutoActive(id: number, active: boolean): Promise<Produto> {
  const response = await api.post<Produto>(`/api/produtos/${id}/${active ? "reativar" : "inativar"}`);
  return response.data;
}
