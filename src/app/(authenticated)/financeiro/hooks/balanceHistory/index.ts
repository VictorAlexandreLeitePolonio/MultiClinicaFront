"use client";

import { useState, useCallback, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { FinancialBalance } from "@/types";

// Opções disponíveis no select de período do gráfico
export type HistoryPeriod = 1 | 3 | 6 | 12;

export function useBalanceHistory(months: HistoryPeriod = 6) {
  const [data, setData] = useState<FinancialBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // months é enviado diretamente como query param:
      // ?months=1  → último 1 mês
      // ?months=3  → últimos 3 meses
      // ?months=6  → últimos 6 meses
      // ?months=12 → últimos 12 meses (1 ano)
      const response = await api.get<FinancialBalance[]>(
        `/api/financial/balance/history?months=${months}`
      );
      setData(response.data);
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
