"use client";

import { useState, useCallback, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { FinancialBalance } from "@/types";

export function useMonthlyBalance(month: string) {
  const [data, setData] = useState<FinancialBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!month) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<FinancialBalance>(`/api/financial/balance/${month}`);
      setData(response.data);
    } catch {
      const msg = "Erro ao carregar dados. Verifique sua conexão.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { fetchBalance(); }, [fetchBalance]);

  return { data, loading, error, refetch: fetchBalance };
}
