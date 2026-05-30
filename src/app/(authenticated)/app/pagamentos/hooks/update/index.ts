"use client";

import { useState, useCallback } from "react";
import { Payment } from "@/types";
import { PagamentoFormData } from "../../schemas/pagamento.schema";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";
import { updatePayment } from "@/services/payments/payments.service";

export function usePagamentoUpdate() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updatePagamento = useCallback(async (id: number, payload: PagamentoFormData): Promise<Payment> => {
    setIsPending(true);
    setError(null);
    try {
      return await updatePayment(id, payload);
    } catch (err) {
      const message = getApiErrorMessage(err, "Erro ao atualizar pagamento. Tente novamente.");
      toast.error(message);
      throw err;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { updatePagamento, isPending, error };
}
