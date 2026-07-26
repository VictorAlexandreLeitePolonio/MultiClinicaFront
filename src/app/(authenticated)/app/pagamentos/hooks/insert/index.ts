"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { Payment } from "@/types";
import { CreatePaymentPayload, createPayment } from "@/app/(authenticated)/app/pagamentos/services/payments.service";

export function usePagamentoInsert() {
  const { mutate: insertPagamento, isPending, error } = useApiMutation<
    CreatePaymentPayload,
    Payment
  >({
    mutationFn: createPayment,
    errorMessage: "Erro ao cadastrar pagamento. Tente novamente.",
  });
  return { insertPagamento, isPending, error };
}
