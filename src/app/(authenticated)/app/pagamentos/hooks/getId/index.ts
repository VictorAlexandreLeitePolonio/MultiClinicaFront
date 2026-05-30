"use client";

import { useState, useCallback, useEffect } from "react";
import { Payment } from "@/types";
import { toast } from "sonner";
import { getPaymentById } from "@/services/payments/payments.service";

export function usePagamentoById(id: number | null) {
  const [data, setData] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPagamento = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const payment = await getPaymentById(id);
      setData(payment);
    } catch {
      const msg = "Erro ao carregar dados. Verifique sua conexão.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchPagamento(); }, [fetchPagamento]);

  return { data, loading, error, refetch: fetchPagamento };
}
