import api from "@/lib/api";
import { normalizePagedResult } from "@/lib/pagination";
import { PagedResult, Payment } from "@/types";
import { PagamentoFormData } from "@/app/(authenticated)/app/pagamentos/schemas/pagamento.schema";

export interface GetPaymentsParams {
  patientName?: string;
  patientId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export type CreatePaymentPayload = PagamentoFormData & { userId: number };

export async function getPayments(params?: GetPaymentsParams): Promise<PagedResult<Payment>> {
  const response = await api.get<PagedResult<Payment> | Payment[]>("/api/payments", {
    params,
  });

  return normalizePagedResult<Payment>(response.data, params?.pageSize);
}

export async function getPaymentById(id: number): Promise<Payment> {
  const response = await api.get<Payment>(`/api/payments/${id}`);

  return response.data;
}

export async function createPayment(payload: CreatePaymentPayload): Promise<Payment> {
  const response = await api.post<Payment>("/api/payments", payload);

  return response.data;
}

export async function updatePayment(id: number, payload: PagamentoFormData): Promise<Payment> {
  const response = await api.put<Payment>(`/api/payments/${id}`, payload);

  return response.data;
}

export async function deletePayment(id: number): Promise<void> {
  await api.delete(`/api/payments/${id}`);
}
