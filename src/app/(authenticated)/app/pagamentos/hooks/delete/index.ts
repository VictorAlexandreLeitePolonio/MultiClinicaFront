"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { deletePayment } from "@/app/(authenticated)/app/pagamentos/services/payments.service";

export function usePagamentoDelete() {
  const { mutate: deletePagamento, isPending, error } = useApiMutation<number, void>({
    mutationFn: deletePayment,
    errorMessage: "Erro ao excluir pagamento. Tente novamente.",
  });
  return { deletePagamento, isPending, error };
}
