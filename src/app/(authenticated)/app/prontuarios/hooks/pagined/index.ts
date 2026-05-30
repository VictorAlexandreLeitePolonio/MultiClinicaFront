"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getMedicalRecords } from "@/services/medical-records/medical-records.service";
import { MedicalRecord, PagedResult } from "@/types";
import { getApiErrorMessage } from "@/utils/apiError";

export interface ProntuarioFilters {
  patientId?: number;
  patientName?: string;
  userId?: number;
  createdAt?: string;
}

export function useProntuariosPaginated(initialFilters?: ProntuarioFilters) {
  const [result, setResult] = useState<PagedResult<MedicalRecord>>({
    data: [],
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<ProntuarioFilters>(initialFilters ?? {});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchRecords = useCallback(
    async (
      currentSearch: string,
      currentFilters: ProntuarioFilters,
      currentPage: number,
      currentPageSize: number
    ) => {
      setLoading(true);
      setError(null);
      try {
        const records = await getMedicalRecords({
          patientName: currentSearch || currentFilters.patientName,
          patientId: currentFilters.patientId,
          userId: currentFilters.userId,
          createdAt: currentFilters.createdAt,
          page: currentPage,
          pageSize: currentPageSize,
        });
        setResult(records);
      } catch (err) {
        const message = getApiErrorMessage(
          err,
          "Erro ao carregar prontuários. Verifique sua conexão."
        );
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
      () => fetchRecords(search, filters, page, pageSize),
      400
    );
    return () => clearTimeout(timer);
  }, [search, filters, page, pageSize, fetchRecords]);

  useEffect(() => {
    setPage(1);
  }, [search, filters, pageSize]);

  const refetch = useCallback(
    () => fetchRecords(search, filters, page, pageSize),
    [fetchRecords, search, filters, page, pageSize]
  );

  const applyFilters = useCallback((newFilters: ProntuarioFilters) => {
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
