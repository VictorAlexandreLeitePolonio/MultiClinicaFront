"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Plan, PagedResult } from "@/types";
import { normalizePagedResult } from "@/lib/pagination";

export function usePlanos() {
  const [data, setData] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlanos = async () => {
      setLoading(true);
      try {
        const response = await api.get<PagedResult<Plan> | Plan[]>("/api/plans");
        const result = normalizePagedResult<Plan>(response.data);
        setData(result.data);
      } catch {
        setError("Erro ao carregar planos.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlanos();
  }, []);

  return { data, loading, error };
}
