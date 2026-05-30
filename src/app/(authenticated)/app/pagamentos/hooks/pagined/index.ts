"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { PagedResult, Payment } from "@/types";
import { getPayments } from "@/services/payments/payments.service";
import { getApiErrorMessage } from "@/utils/apiError";

export interface PagamentoFilters {
  patientId?: string;
  status?: string;
}

export function usePagamentosPaginated(initialFilters?: PagamentoFilters) {
  const [result, setResult] = useState<PagedResult<Payment>>({
    data: [],
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<PagamentoFilters>(initialFilters ?? {});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchPayments = useCallback(
    async (
      currentSearch: string,
      currentFilters: PagamentoFilters,
      currentPage: number,
      currentPageSize: number
    ) => {
      setLoading(true);
      setError(null);
      try {
        const payments = await getPayments({
          patientName: currentSearch || undefined,
          patientId: currentFilters.patientId,
          status: currentFilters.status,
          page: currentPage,
          pageSize: currentPageSize,
        });
        setResult(payments);
      } catch (err) {
        const message = getApiErrorMessage(err, "Erro ao carregar pagamentos. Verifique sua conexão.");
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
      () => fetchPayments(search, filters, page, pageSize),
      400
    );
    return () => clearTimeout(timer);
  }, [search, filters, page, pageSize, fetchPayments]);

  useEffect(() => {
    setPage(1);
  }, [search, filters, pageSize]);

  const refetch = useCallback(
    () => fetchPayments(search, filters, page, pageSize),
    [fetchPayments, search, filters, page, pageSize]
  );

  const applyFilters = useCallback((newFilters: PagamentoFilters) => {
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
