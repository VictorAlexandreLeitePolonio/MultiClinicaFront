"use client";

import { useState, useCallback } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";

export function useAgendaChangeStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changeStatus = useCallback(async (id: number, status: "Scheduled" | "Completed" | "Cancelled") => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.patch<{ id: number; status: string }>(
        `/api/appointments/${id}/status`,
        { status }
      );
      return { success: true, status: response.data.status };
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
