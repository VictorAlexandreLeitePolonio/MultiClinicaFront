import axios from "axios";
import api from "@/lib/api";
import { normalizePagedResult } from "@/lib/pagination";
import { AjustarCaixaFormData, AbrirCaixaFormData, FecharCaixaFormData } from "@/app/(authenticated)/app/financeiro/caixa/schemas/caixa.schema";
import { Caixa, MovimentacaoResumo, PagedResult, StatusCaixa } from "@/types";

export interface GetCaixasParams {
  status?: StatusCaixa;
  page?: number;
  pageSize?: number;
}

export async function getCaixas(params?: GetCaixasParams): Promise<PagedResult<Caixa>> {
  const response = await api.get<PagedResult<Caixa> | Caixa[]>("/api/caixa", { params });

  return normalizePagedResult<Caixa>(response.data, params?.pageSize);
}

export async function getCaixaAtual(): Promise<Caixa | null> {
  try {
    const response = await api.get<Caixa>("/api/caixa/atual");
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    throw err;
  }
}

export async function getMovimentacoesCaixa(id: number): Promise<MovimentacaoResumo[]> {
  const response = await api.get<MovimentacaoResumo[]>(`/api/caixa/${id}/movimentacoes`);

  return response.data;
}

export async function abrirCaixa(payload: AbrirCaixaFormData): Promise<Caixa> {
  const response = await api.post<Caixa>("/api/caixa/abrir", payload);

  return response.data;
}

export async function fecharCaixa(id: number, payload: FecharCaixaFormData): Promise<Caixa> {
  const response = await api.post<Caixa>(`/api/caixa/${id}/fechar`, payload);

  return response.data;
}

export async function reabrirCaixa(id: number, motivo: string): Promise<Caixa> {
  const response = await api.post<Caixa>(`/api/caixa/${id}/reabrir`, { motivo });

  return response.data;
}

export async function ajustarCaixa(id: number, payload: AjustarCaixaFormData): Promise<Caixa> {
  const response = await api.post<Caixa>(`/api/caixa/${id}/ajustar`, payload);

  return response.data;
}

export async function cancelarCaixa(id: number, motivo: string): Promise<Caixa> {
  const response = await api.post<Caixa>(`/api/caixa/${id}/cancelar`, { motivo });

  return response.data;
}
