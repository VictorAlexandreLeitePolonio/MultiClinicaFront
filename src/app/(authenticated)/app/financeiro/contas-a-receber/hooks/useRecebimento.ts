"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getRecebimentosPorConta } from "@/services/recebimentos/recebimentos.service";
import { Recebimento } from "@/types";
import { getApiErrorMessage } from "@/utils/apiError";

export function useRecebimentosPorConta(contaReceberId: number) {
  const [data, setData] = useState<Recebimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getRecebimentosPorConta(contaReceberId));
    } catch (err) {
      const message = getApiErrorMessage(err, "Erro ao carregar recebimentos.");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [contaReceberId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
