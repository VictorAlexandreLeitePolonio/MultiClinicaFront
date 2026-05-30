"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";
import { deleteExpense as deleteExpenseRequest } from "@/services/financial/financial.service";

export function useExpenseDelete() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteExpense = useCallback(async (id: number): Promise<void> => {
    setIsPending(true);
    setError(null);
    try {
      await deleteExpenseRequest(id);
    } catch (err) {
      const message = getApiErrorMessage(err, "Erro ao excluir gasto. Tente novamente.");
      toast.error(message);
      throw err;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { deleteExpense, isPending, error };
}
