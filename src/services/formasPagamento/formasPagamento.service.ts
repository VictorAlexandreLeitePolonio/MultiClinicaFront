import api from "@/lib/api";
import { normalizePagedResult } from "@/lib/pagination";
import { FormaPagamento, PagedResult } from "@/types";
import { FormaPagamentoFormData } from "@/app/(authenticated)/app/financeiro/configuracoes/schemas/formaPagamento.schema";

export interface GetFormasPagamentoParams {
  nome?: string;
  page?: number;
  pageSize?: number;
}

export async function getFormasPagamento(
  params?: GetFormasPagamentoParams
): Promise<PagedResult<FormaPagamento>> {
  const response = await api.get<PagedResult<FormaPagamento> | FormaPagamento[]>("/api/formas-pagamento", {
    params,
  });

  return normalizePagedResult<FormaPagamento>(response.data, params?.pageSize);
}

export async function createFormaPagamento(payload: FormaPagamentoFormData): Promise<FormaPagamento> {
  const response = await api.post<FormaPagamento>("/api/formas-pagamento", payload);

  return response.data;
}

export async function updateFormaPagamento(
  id: number,
  payload: FormaPagamentoFormData
): Promise<FormaPagamento> {
  const response = await api.put<FormaPagamento>(`/api/formas-pagamento/${id}`, payload);

  return response.data;
}

export async function setFormaPagamentoActive(id: number, active: boolean): Promise<FormaPagamento> {
  const response = await api.post<FormaPagamento>(
    `/api/formas-pagamento/${id}/${active ? "reativar" : "inativar"}`
  );

  return response.data;
}
