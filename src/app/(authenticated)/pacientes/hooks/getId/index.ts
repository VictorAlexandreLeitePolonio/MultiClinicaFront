"use client";

import { useState, useCallback, useEffect } from "react";
import api from "@/lib/api";
import { Patient } from "@/types";
import { toast } from "sonner";

export function usePacienteById(id: number | null) {
  const [data, setData] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPaciente = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Patient>(`/api/patients/${id}`);
      setData(response.data);
    } catch {
      const msg = "Erro ao carregar dados. Verifique sua conexão.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchPaciente(); }, [fetchPaciente]);

  return { data, loading, error, refetch: fetchPaciente };
}
