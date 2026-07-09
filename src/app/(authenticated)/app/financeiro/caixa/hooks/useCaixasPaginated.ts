"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getCaixas } from "@/services/caixa/caixa.service";
import { Caixa, PagedResult, StatusCaixa } from "@/types";
import { getApiErrorMessage } from "@/utils/apiError";

export function useCaixasPaginated() {
  const [result, setResult] = useState<PagedResult<Caixa>>({
    data: [],
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusCaixa | "">("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(
    async (currentStatus: StatusCaixa | "", currentPage: number, currentPageSize: number) => {
      setLoading(true);
      setError(null);
      try {
        setResult(
          await getCaixas({
            status: currentStatus || undefined,
            page: currentPage,
            pageSize: currentPageSize,
          })
        );
      } catch (err) {
        const message = getApiErrorMessage(err, "Erro ao carregar histórico de caixas.");
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
