"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { PagedResult, Patient } from "@/types";
import { getPatients } from "@/services/patients/patients.service";
import { getApiErrorMessage } from "@/utils/apiError";

export interface PacienteFilters {
  appointmentStatus?: string;
  paymentStatus?: string;
}

export function usePacientesPaginated(initialFilters?: PacienteFilters) {
  const [result, setResult] = useState<PagedResult<Patient>>({
    data: [],
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<PacienteFilters>(initialFilters ?? {});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchPatients = useCallback(
    async (
      currentSearch: string,
      currentFilters: PacienteFilters,
      currentPage: number,
      currentPageSize: number
    ) => {
      setLoading(true);
      setError(null);
      try {
        const patients = await getPatients({
          name: currentSearch || undefined,
          appointmentStatus: currentFilters.appointmentStatus,
          paymentStatus: currentFilters.paymentStatus,
          page: currentPage,
          pageSize: currentPageSize,
        });
        setResult(patients);
      } catch (err) {
        const message = getApiErrorMessage(err, "Erro ao carregar pacientes. Verifique sua conexão.");
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
      () => fetchPatients(search, filters, page, pageSize),
      400
    );
    return () => clearTimeout(timer);
  }, [search, filters, page, pageSize, fetchPatients]);

  useEffect(() => {
    setPage(1);
  }, [search, filters, pageSize]);

  const refetch = useCallback(
    () => fetchPatients(search, filters, page, pageSize),
    [fetchPatients, search, filters, page, pageSize]
  );

  const applyFilters = useCallback((newFilters: PacienteFilters) => {
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
