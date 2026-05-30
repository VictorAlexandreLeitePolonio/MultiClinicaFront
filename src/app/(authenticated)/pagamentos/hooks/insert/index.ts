"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import api from "@/lib/api";
import { Payment } from "@/types";
import { PagamentoFormData } from "../../schemas/pagamento.schema";

export function usePagamentoInsert() {
  const { mutate: insertPagamento, isPending, error } = useApiMutation<
    PagamentoFormData & { userId: number },
    Payment
  >({
    mutationFn: (payload) => api.post<Payment>("/api/payments", payload).then((r) => r.data),
    errorMessage: "Erro ao cadastrar pagamento. Tente novamente.",
  });
  return { insertPagamento, isPending, error };
}
