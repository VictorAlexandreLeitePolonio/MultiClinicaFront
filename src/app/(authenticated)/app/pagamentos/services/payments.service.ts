import api from '@/lib/api'
import { normalizePagedResult } from '@/lib/pagination'
import { CreatePaymentDto, PagedResult, Payment } from '@/types'
import { PagamentoFormData } from '@/app/(authenticated)/app/pagamentos/schemas/pagamento.schema'

export interface GetPaymentsParams {
  patientName?: string
  patientId?: string
  status?: string
  referenceMonth?: string
  page?: number
  pageSize?: number
}

export type CreatePaymentPayload = CreatePaymentDto & { responsavelId: number }

const normalizePaymentDates = (payload: PagamentoFormData): PagamentoFormData => ({
  ...payload,
  paidAt: payload.paidAt || undefined,
  paymentDate: payload.paymentDate || null,
})

export async function getPayments(
  params?: GetPaymentsParams,
): Promise<PagedResult<Payment>> {
  const response = await api.get<PagedResult<Payment> | Payment[]>(
    '/api/payments',
    {
      params,
    },
  )

  return normalizePagedResult<Payment>(response.data, params?.pageSize)
}

export async function getPaymentById(id: number): Promise<Payment> {
  const response = await api.get<Payment>(`/api/payments/${id}`)

  return response.data
}

export async function createPayment(
  payload: CreatePaymentPayload,
): Promise<Payment> {
  const { responsavelId, sendOnline, ...formData } = payload
  const response = await api.post<Payment>('/api/payments', {
    ...normalizePaymentDates(formData),
    responsavelId,
    sendOnline,
  })

  return response.data
}

export async function updatePayment(
  id: number,
  payload: PagamentoFormData,
): Promise<Payment> {
  const response = await api.put<Payment>(
    `/api/payments/${id}`,
    normalizePaymentDates(payload),
  )

  return response.data
}

export async function deletePayment(id: number): Promise<void> {
  await api.delete(`/api/payments/${id}`)
}
