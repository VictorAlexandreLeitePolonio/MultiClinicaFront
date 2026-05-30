"use client";

import { useState, useCallback, useEffect } from "react";
import api from "@/lib/api";
import { Expense } from "@/types";

export function useExpenseById(id: number | null) {
  const [data, setData] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpense = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Expense>(`/api/financial/expenses/${id}`);
      setData(response.data);
    } catch {
      setError("Gasto não encontrado.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchExpense(); }, [fetchExpense]);

  return { data, loading, error, refetch: fetchExpense };
}
