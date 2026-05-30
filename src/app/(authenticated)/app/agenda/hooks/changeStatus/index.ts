"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";
import { changeAppointmentStatus } from "@/services/appointments/appointments.service";

export function useAgendaChangeStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changeStatus = useCallback(async (id: number, status: "Scheduled" | "Completed" | "Cancelled") => {
    setLoading(true);
    setError(null);
    try {
      const data = await changeAppointmentStatus(id, { status });
      return { success: true, status: data.status };
    } catch (err) {
      const message = getApiErrorMessage(err, "Erro ao alterar status do agendamento. Tente novamente.");
      setError(message);
      toast.error(message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  return { changeStatus, loading, error };
}
