"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import api from "@/lib/api";

export function usePagamentoDelete() {
  const { mutate: deletePagamento, isPending, error } = useApiMutation<number, void>({
    mutationFn: (id) => api.delete(`/api/payments/${id}`).then(() => undefined),
    errorMessage: "Erro ao excluir pagamento. Tente novamente.",
  });
  return { deletePagamento, isPending, error };
}
