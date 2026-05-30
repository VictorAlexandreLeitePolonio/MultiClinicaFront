"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { PatientProfile } from "@/types";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";

export function useGetPatientProfile(id: number | null) {
  const [data, setData] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!id) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.get<PatientProfile>(`/api/patients/${id}/profile`);
      setData(response.data);
    } catch (err) {
      const message = getApiErrorMessage(err, "Erro ao carregar perfil do paciente.");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { data, loading, error, refetch: fetchProfile };
}
