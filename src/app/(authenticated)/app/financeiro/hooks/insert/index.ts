"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Expense } from "@/types";
import { ExpenseFormData } from "../../schemas/expense.schema";
import { getApiErrorMessage } from "@/utils/apiError";
import { createExpense } from "@/services/financial/financial.service";

export function useExpenseInsert() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const insertExpense = useCallback(async (payload: ExpenseFormData): Promise<Expense> => {
    setIsPending(true);
    setError(null);
    try {
      return await createExpense(payload);
    } catch (err) {
      const message = getApiErrorMessage(err, "Erro ao cadastrar gasto. Tente novamente.");
      toast.error(message);
      throw err;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { insertExpense, isPending, error };
}
