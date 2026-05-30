"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { PagedResult, Plan } from "@/types";
import { getPlans } from "@/services/plans/plans.service";
import { getApiErrorMessage } from "@/utils/apiError";

export function usePlanosPaginated() {
  const [result, setResult] = useState<PagedResult<Plan>>({
    data: [],
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchPlans = useCallback(
    async (currentSearch: string, currentPage: number, currentPageSize: number) => {
      setLoading(true);
      setError(null);
      try {
        const plans = await getPlans({
          name: currentSearch || undefined,
          page: currentPage,
          pageSize: currentPageSize,
        });
        setResult(plans);
      } catch (err) {
        const message = getApiErrorMessage(err, "Erro ao carregar planos. Verifique sua conexão.");
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
      () => fetchPlans(search, page, pageSize),
      400
    );
    return () => clearTimeout(timer);
  }, [search, page, pageSize, fetchPlans]);

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  const refetch = useCallback(
    () => fetchPlans(search, page, pageSize),
    [fetchPlans, search, page, pageSize]
  );

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
    refetch,
  };
}
