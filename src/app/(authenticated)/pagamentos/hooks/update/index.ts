"use client";

import { useState, useCallback } from "react";
import api from "@/lib/api";
import { Payment } from "@/types";
import { PagamentoFormData } from "../../schemas/pagamento.schema";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";

export function usePagamentoUpdate() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updatePagamento = useCallback(async (id: number, payload: PagamentoFormData): Promise<Payment> => {
    setIsPending(true);
    setError(null);
    try {
      const response = await api.put<Payment>(`/api/payments/${id}`, payload);
      return response.data;
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
