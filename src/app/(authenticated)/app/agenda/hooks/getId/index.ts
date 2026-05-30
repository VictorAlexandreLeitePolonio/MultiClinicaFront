"use client";

import { useState, useCallback, useEffect } from "react";
import { Appointment } from "@/types";
import { toast } from "sonner";
import { getAppointmentById } from "@/services/appointments/appointments.service";

export function useAgendaById(id: number | null) {
  const [data, setData] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAgenda = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const appointment = await getAppointmentById(id);
      setData(appointment);
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
