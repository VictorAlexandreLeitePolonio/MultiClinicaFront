"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { FinancialBalance } from "@/types";
import {
  BalanceHistoryPeriod,
  getFinancialBalanceHistory,
} from "@/services/financial/financial.service";

// Opções disponíveis no select de período do gráfico
export type HistoryPeriod = BalanceHistoryPeriod;

export function useBalanceHistory(months: HistoryPeriod = 6) {
  const [data, setData] = useState<FinancialBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const history = await getFinancialBalanceHistory(months);
      setData(history);
    } catch {
      const msg = "Erro ao carregar dados. Verifique sua conexão.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [months]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  return { data, loading, error, refetch: fetchHistory };
}
