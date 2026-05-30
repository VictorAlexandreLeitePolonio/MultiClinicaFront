"use client";

import { useState, useEffect } from "react";
import { Plan } from "@/types";
import { getPlans } from "@/services/plans/plans.service";

export function usePlanos() {
  const [data, setData] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlanos = async () => {
      setLoading(true);
      try {
        const result = await getPlans();
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
