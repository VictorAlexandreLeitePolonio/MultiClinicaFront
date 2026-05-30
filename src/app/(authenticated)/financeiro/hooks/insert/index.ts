"use client";

import { useState, useCallback } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Expense } from "@/types";
import { ExpenseFormData } from "../../schemas/expense.schema";
import { getApiErrorMessage } from "@/utils/apiError";

export function useExpenseInsert() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const insertExpense = useCallback(async (payload: ExpenseFormData): Promise<Expense> => {
    setIsPending(true);
    setError(null);
    try {
      const response = await api.post<Expense>("/api/financial/expenses", payload);
      return response.data;
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
