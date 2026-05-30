"use client";

import api from "@/lib/api";
import { Appointment, PagedResult } from "@/types";
import { normalizePagedResult } from "@/lib/pagination";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface UseTodayAppointmentsReturn {
  data: Appointment[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useTodayAppointments = (): UseTodayAppointmentsReturn => {
  const [data, setData] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const fetchTodayAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<PagedResult<Appointment> | Appointment[]>(
        `/api/appointments?date=${today}`
      );
      const result = normalizePagedResult<Appointment>(response.data);
      setData(result.data);
    } catch {
      const msg = "Erro ao carregar dados. Verifique sua conexão.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    fetchTodayAppointments();
  }, [fetchTodayAppointments]);

  return {
    data,
    total: data.length,
    loading,
    error,
    refetch: fetchTodayAppointments,
  };
};
