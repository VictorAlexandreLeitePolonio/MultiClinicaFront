"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getContasReceber } from "@/services/contasReceber/contasReceber.service";
import { ContaReceber, PagedResult, StatusContaReceber } from "@/types";
import { getApiErrorMessage } from "@/utils/apiError";

export function useContasReceberPaginated() {
  const [result, setResult] = useState<PagedResult<ContaReceber>>({
    data: [],
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusContaReceber | "">("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(
    async (currentStatus: StatusContaReceber | "", currentPage: number, currentPageSize: number) => {
      setLoading(true);
      setError(null);
      try {
        const data = await getContasReceber({
          status: currentStatus || undefined,
          page: currentPage,
          pageSize: currentPageSize,
        });
        setResult(data);
      } catch (err) {
        const message = getApiErrorMessage(err, "Erro ao carregar contas a receber.");
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchData(status, page, pageSize);
  }, [status, page, pageSize, fetchData]);

  useEffect(() => {
    setPage(1);
  }, [status, pageSize]);

  const refetch = useCallback(() => fetchData(status, page, pageSize), [fetchData, status, page, pageSize]);

  return {
    data: result.data,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages: result.totalPages,
    loading,
    error,
    status,
    setStatus,
    refetch,
  };
}
