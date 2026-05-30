"use client";

import { useState, useCallback, useEffect } from "react";
import { Expense } from "@/types";
import { getExpenseById } from "@/services/financial/financial.service";

export function useExpenseById(id: number | null) {
  const [data, setData] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpense = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const expense = await getExpenseById(id);
      setData(expense);
    } catch {
      setError("Gasto não encontrado.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchExpense(); }, [fetchExpense]);

  return { data, loading, error, refetch: fetchExpense };
}
