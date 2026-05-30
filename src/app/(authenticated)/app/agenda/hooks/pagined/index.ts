"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Appointment, PagedResult } from "@/types";
import { getAppointments } from "@/services/appointments/appointments.service";
import { getApiErrorMessage } from "@/utils/apiError";

export interface AgendaFilters {
  status?: string;
  patientId?: number;
}

export function useAgendaPaginated(initialFilters?: AgendaFilters) {
  const [result, setResult] = useState<PagedResult<Appointment>>({
    data: [],
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<AgendaFilters>(initialFilters ?? {});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchAppointments = useCallback(
    async (
      currentSearch: string,
      currentFilters: AgendaFilters,
      currentPage: number,
      currentPageSize: number
    ) => {
      setLoading(true);
      setError(null);
      try {
        const appointments = await getAppointments({
          patientName: currentSearch || undefined,
          status: currentFilters.status,
          patientId: currentFilters.patientId,
          page: currentPage,
          pageSize: currentPageSize,
        });
        setResult(appointments);
      } catch (err) {
        const message = getApiErrorMessage(err, "Erro ao carregar agenda. Verifique sua conexão.");
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const timer = setTimeout(
      () => fetchAppointments(search, filters, page, pageSize),
      400
    );
    return () => clearTimeout(timer);
  }, [search, filters, page, pageSize, fetchAppointments]);

  useEffect(() => {
    setPage(1);
  }, [search, filters, pageSize]);

  const refetch = useCallback(
    () => fetchAppointments(search, filters, page, pageSize),
    [fetchAppointments, search, filters, page, pageSize]
  );

  const applyFilters = useCallback((newFilters: AgendaFilters) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    data: result.data,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages: result.totalPages,
    totalCount: result.totalCount,
    loading,
    error,
    search,
    setSearch,
    filters,
    applyFilters,
    clearFilters,
    refetch,
  };
}
