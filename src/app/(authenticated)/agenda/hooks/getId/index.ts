"use client";

import { useState, useCallback, useEffect } from "react";
import api from "@/lib/api";
import { Appointment } from "@/types";
import { toast } from "sonner";

export function useAgendaById(id: number | null) {
  const [data, setData] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAgenda = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Appointment>(`/api/appointments/${id}`);
      setData(response.data);
    } catch {
      const msg = "Erro ao carregar dados. Verifique sua conexão.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAgenda(); }, [fetchAgenda]);

  return { data, loading, error, refetch: fetchAgenda };
}
