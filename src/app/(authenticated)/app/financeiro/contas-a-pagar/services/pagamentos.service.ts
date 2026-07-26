import api from "@/lib/api";
import type { PagamentoContaPagar } from "./contasPagar.service";

export interface RegistrarPagamentoPayload {
  contaPagarId: number;
  contaFinanceiraId: number;
  formaPagamentoId: number;
  valor: number;
  dataPagamento: string;
  observacao?: string | null;
}

export interface EstornarPagamentoPayload {
  motivo: string;
}

export async function registrarPagamento(
  payload: RegistrarPagamentoPayload,
): Promise<PagamentoContaPagar> {
  const response = await api.post<PagamentoContaPagar>("/api/pagamentos", payload);

  return response.data;
}

export async function estornarPagamento(
  id: number,
  payload: EstornarPagamentoPayload,
): Promise<PagamentoContaPagar> {
  const response = await api.post<PagamentoContaPagar>(
    `/api/pagamentos/${id}/estornar`,
    payload,
  );

  return response.data;
}
