import publicApi from "@/lib/publicApi";
import { PayResult, PublicPayment } from "@/types/mercadoPago";

/** Campos do formData do Payment Brick que o back precisa para criar o pagamento. */
export interface PublicPaymentFormData {
  token?: string;
  payment_method_id: string;
  issuer_id?: string;
  installments?: number;
  payer: {
    email: string;
    identification?: { type: string; number: string };
  };
}

export async function getPublicPayment(token: string): Promise<PublicPayment> {
  const response = await publicApi.get<PublicPayment>(
    `/api/public/payments/${encodeURIComponent(token)}`,
  );
  return response.data;
}

export async function payPublicPayment(
  token: string,
  formData: PublicPaymentFormData,
): Promise<PayResult> {
  const response = await publicApi.post<PayResult>(
    `/api/public/payments/${encodeURIComponent(token)}/pay`,
    formData,
  );
  return response.data;
}
