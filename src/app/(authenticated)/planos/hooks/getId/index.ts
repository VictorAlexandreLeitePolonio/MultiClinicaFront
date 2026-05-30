"use client";

import { useState, useCallback, useEffect } from "react";
import api from "@/lib/api";
import { Plan } from "@/types";
import { toast } from "sonner";

export function usePlanoById(id: number | null) {
  const [data, setData] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlano = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Plan>(`/api/plans/${id}`);
      setData(response.data);
    } catch {
      const msg = "Erro ao carregar dados. Verifique sua conexão.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchPlano(); }, [fetchPlano]);

  return { data, loading, error, refetch: fetchPlano };
}
