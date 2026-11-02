import { Appointment, PagedResult } from "@/types";
import { getAppointments } from "@/app/(authenticated)/app/agenda/services/appointments.service";
import { todayCivilDate } from "@/utils/formatters";
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
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = todayCivilDate();

  const fetchTodayAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result: PagedResult<Appointment> = await getAppointments({
        date: today,
        pageSize: 100,
      });
      setData(result.data);
      setTotal(result.totalCount);
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
    total,
    loading,
    error,
    refetch: fetchTodayAppointments,
  };
};
