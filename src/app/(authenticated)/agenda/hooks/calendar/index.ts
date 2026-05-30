"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { Appointment, PagedResult } from "@/types";
import { normalizePagedResult } from "@/lib/pagination";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajusta para segunda-feira
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getEndOfWeek(date: Date): Date {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Domingo
  end.setHours(23, 59, 59, 999);
  return end;
}

function formatDateForApi(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function useAgendaCalendar(weekStart: Date) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dateFrom = getStartOfWeek(weekStart);
      const dateTo = getEndOfWeek(weekStart);

      const params = new URLSearchParams();
      params.append("dateFrom", formatDateForApi(dateFrom));
      params.append("dateTo", formatDateForApi(dateTo));
      params.append("pageSize", "100");

      const response = await api.get<PagedResult<Appointment> | Appointment[]>(`/api/appointments?${params.toString()}`);
      const result = normalizePagedResult<Appointment>(response.data, 100);
      setAppointments(result.data);
    } catch (err) {
      const message = getApiErrorMessage(err, "Erro ao carregar agenda.");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return { appointments, loading, error, refetch: fetchAppointments };
}
