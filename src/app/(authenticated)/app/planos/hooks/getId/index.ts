"use client";

import { useState, useCallback, useEffect } from "react";
import { Plan } from "@/types";
import { toast } from "sonner";
import { getPlanById } from "@/services/plans/plans.service";

export function usePlanoById(id: number | null) {
  const [data, setData] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlano = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const plan = await getPlanById(id);
      setData(plan);
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
