"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import {
  createContaFinanceira,
  getContasFinanceiras,
  setContaFinanceiraActive,
  updateContaFinanceira,
} from "@/services/contasFinanceiras/contasFinanceiras.service";
import { ContaFinanceira, PagedResult } from "@/types";
import { getApiErrorMessage } from "@/utils/apiError";
import { ContaFinanceiraFormData } from "../schemas/contaFinanceira.schema";

export function useContasFinanceirasPaginated() {
  const [result, setResult] = useState<PagedResult<ContaFinanceira>>({
    data: [],
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(
    async (currentSearch: string, currentPage: number, currentPageSize: number) => {
      setLoading(true);
      setError(null);
      try {
        const data = await getContasFinanceiras({
          nome: currentSearch || undefined,
          page: currentPage,
          pageSize: currentPageSize,
        });
        setResult(data);
      } catch (err) {
        const message = getApiErrorMessage(err, "Erro ao carregar contas financeiras.");
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => fetchData(search, page, pageSize), 400);
    return () => clearTimeout(timer);
  }, [search, page, pageSize, fetchData]);

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  const refetch = useCallback(
    () => fetchData(search, page, pageSize),
    [fetchData, search, page, pageSize]
  );

  return {
    data: result.data,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages: result.totalPages,
    loading,
    error,
    search,
    setSearch,
    refetch,
  };
}

export function useContaFinanceiraInsert() {
  const { mutate: insertContaFinanceira, isPending, error } = useApiMutation<
    ContaFinanceiraFormData,
    ContaFinanceira
  >({
    mutationFn: createContaFinanceira,
    errorMessage: "Erro ao cadastrar conta financeira",
  });

  return { insertContaFinanceira, isPending, error };
}

export function useContaFinanceiraUpdate() {
  const { mutate, isPending, error } = useApiMutation<
    { id: number; payload: ContaFinanceiraFormData },
    ContaFinanceira
  >({
    mutationFn: ({ id, payload }) => updateContaFinanceira(id, payload),
    errorMessage: "Erro ao atualizar conta financeira",
  });

  const update = (id: number, payload: ContaFinanceiraFormData) => mutate({ id, payload });

  return { updateContaFinanceira: update, isPending, error };
}

export function useContaFinanceiraSetActive() {
  const { mutate, isPending, error } = useApiMutation<{ id: number; active: boolean }, ContaFinanceira>({
    mutationFn: ({ id, active }) => setContaFinanceiraActive(id, active),
    errorMessage: "Erro ao atualizar status da conta financeira",
  });

  const setActive = (id: number, active: boolean) => mutate({ id, active });

  return { setContaFinanceiraActive: setActive, isPending, error };
}
