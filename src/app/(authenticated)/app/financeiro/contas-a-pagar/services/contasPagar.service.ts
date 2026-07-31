import api from "@/lib/api";
import { normalizePagedResult } from "@/lib/pagination";
import type { PagedResult } from "@/types";

export type StatusContaPagar = "Aberta" | "Parcial" | "Paga" | "Cancelada";
export type OrigemContaPagar = "Manual" | "Compra" | "DespesaRecorrente" | "Outro";

export interface ContaPagar {
  id: number;
  fornecedorId: number;
  categoriaFinanceiraId: number | null;
  descricao: string;
  valorOriginal: number;
  valorDesconto: number;
  valorJuros: number;
  valorTotal: number;
  valorPago: number;
  dataEmissao: string;
  dataVencimento: string;
  dataPagamento: string | null;
  status: StatusContaPagar;
  vencida: boolean;
  origem: OrigemContaPagar;
  origemId: number | null;
  observacao: string | null;
  createdAt: string;
}

export interface PagamentoContaPagar {
  id: number;
  contaPagarId: number;
  contaFinanceiraId: number;
  formaPagamentoId: number;
  valor: number;
  dataPagamento: string;
  observacao: string | null;
  isEstornado: boolean;
  createdAt: string;
}

export interface GetContasPagarParams {
  fornecedorId?: number;
  status?: StatusContaPagar;
  page: number;
  pageSize: number;
}

export interface CreateContaPagarPayload {
  fornecedorId: number;
  categoriaFinanceiraId?: number | null;
  descricao: string;
  valorOriginal: number;
  valorDesconto: number;
  valorJuros: number;
  dataEmissao: string;
  dataVencimento: string;
  origem?: OrigemContaPagar;
  origemId?: number | null;
  observacao?: string | null;
}

export interface UpdateContaPagarPayload {
  categoriaFinanceiraId?: number | null;
  descricao: string;
  valorOriginal: number;
  valorDesconto: number;
  valorJuros: number;
  dataVencimento: string;
  observacao?: string | null;
}

export async function getContasPagar(
  params: GetContasPagarParams,
): Promise<PagedResult<ContaPagar>> {
  const response = await api.get<PagedResult<ContaPagar> | ContaPagar[]>(
    "/api/contas-pagar",
    { params },
  );

  return normalizePagedResult<ContaPagar>(response.data, params.pageSize);
}

export async function getContaPagar(id: number): Promise<ContaPagar> {
  const response = await api.get<ContaPagar>(`/api/contas-pagar/${id}`);

  return response.data;
}

export async function createContaPagar(
  payload: CreateContaPagarPayload,
): Promise<ContaPagar> {
  const response = await api.post<ContaPagar>("/api/contas-pagar", {
    ...payload,
    origem: payload.origem ?? "Manual",
  });

  return response.data;
}

export async function updateContaPagar(
  id: number,
  payload: UpdateContaPagarPayload,
): Promise<ContaPagar> {
  const response = await api.put<ContaPagar>(`/api/contas-pagar/${id}`, payload);

  return response.data;
}

export async function cancelarContaPagar(id: number, motivo: string): Promise<ContaPagar> {
  const response = await api.post<ContaPagar>(`/api/contas-pagar/${id}/cancelar`, {
    motivo,
  });

  return response.data;
}
