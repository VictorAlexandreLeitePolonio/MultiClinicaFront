"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Expense } from "@/types";
import { ExpenseFormData } from "../../schemas/expense.schema";
import { getApiErrorMessage } from "@/utils/apiError";
import { updateExpense as updateExpenseRequest } from "@/services/financial/financial.service";

export function useExpenseUpdate() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateExpense = useCallback(async (id: number, payload: ExpenseFormData): Promise<Expense> => {
    setIsPending(true);
    setError(null);
    try {
      return await updateExpenseRequest(id, payload);
    } catch (err) {
      const message = getApiErrorMessage(err, "Erro ao atualizar gasto. Tente novamente.");
      toast.error(message);
      throw err;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { updateExpense, isPending, error };
}
