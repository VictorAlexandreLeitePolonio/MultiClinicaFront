"use client";

import { useState, useCallback, useEffect } from "react";
import { Patient } from "@/types";
import { toast } from "sonner";
import { getPatientById } from "@/services/patients/patients.service";

export function usePacienteById(id: number | null) {
  const [data, setData] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPaciente = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const patient = await getPatientById(id);
      setData(patient);
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
