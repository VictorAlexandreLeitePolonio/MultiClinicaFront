import api from "@/lib/api";

export async function sendPaymentCharge(id: number): Promise<void> {
  await api.post(`/api/payments/${id}/send`);
}

export async function getPaymentLink(id: number): Promise<{ url: string }> {
  const response = await api.get<{ url: string }>(`/api/payments/${id}/link`);
  return response.data;
}

export async function refundPayment(id: number): Promise<void> {
  await api.post(`/api/payments/${id}/refund`);
}

export async function refundDuplicate(id: number): Promise<void> {
  await api.post(`/api/payments/${id}/refund-duplicate`);
}
