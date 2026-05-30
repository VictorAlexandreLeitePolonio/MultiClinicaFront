"use client";

import { useState, useCallback, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Expense, PagedResult } from "@/types";
import { normalizePagedResult } from "@/lib/pagination";
import { getApiErrorMessage } from "@/utils/apiError";

export function useExpensesPaginated() {
  const [result, setResult] = useState<PagedResult<Expense>>({
    data: [],
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Mês padrão = mês atual calculado automaticamente
  const [month, setMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchExpenses = useCallback(async (
    title?: string,
    currentMonth?: string,
    currentPage?: number,
    currentPageSize?: number
  ) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (title) params.append("title", title);
      if (currentMonth) params.append("month", currentMonth);
      params.append("page", (currentPage ?? page).toString());
      params.append("pageSize", (currentPageSize ?? pageSize).toString());

      const response = await api.get<PagedResult<Expense> | Expense[]>(
        `/api/financial/expenses?${params.toString()}`
      );
      setResult(normalizePagedResult<Expense>(response.data, currentPageSize ?? pageSize));
    } catch (err) {
      const msg = getApiErrorMessage(err, "Erro ao carregar gastos. Verifique sua conexão.");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    const timer = setTimeout(
      () => fetchExpenses(search || undefined, month, page, pageSize),
      400
    );
    return () => clearTimeout(timer);
  }, [search, month, page, pageSize, fetchExpenses]);

  useEffect(() => { setPage(1); }, [search, month, pageSize]);

  const refetch = useCallback(
    () => fetchExpenses(search || undefined, month, page, pageSize),
    [fetchExpenses, search, month, page, pageSize]
  );

  return {
    data: result.data,
    page, setPage,
    pageSize, setPageSize,
    totalPages: result.totalPages,
    totalCount: result.totalCount,
    loading, error,
    search, setSearch,
    month, setMonth,   // <-- exposto para o FilterPopover controlar
    refetch,
  };
}
