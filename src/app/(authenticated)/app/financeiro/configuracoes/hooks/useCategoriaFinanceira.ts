"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import {
  createCategoriaFinanceira,
  getCategoriasFinanceiras,
  setCategoriaFinanceiraActive,
  updateCategoriaFinanceira,
} from "@/services/categoriasFinanceiras/categoriasFinanceiras.service";
import { CategoriaFinanceira, PagedResult } from "@/types";
import { getApiErrorMessage } from "@/utils/apiError";
import { CategoriaFinanceiraFormData } from "../schemas/categoriaFinanceira.schema";

export function useCategoriasFinanceirasPaginated() {
  const [result, setResult] = useState<PagedResult<CategoriaFinanceira>>({
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
        const data = await getCategoriasFinanceiras({
          nome: currentSearch || undefined,
          page: currentPage,
          pageSize: currentPageSize,
        });
        setResult(data);
      } catch (err) {
        const message = getApiErrorMessage(err, "Erro ao carregar categorias financeiras.");
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

export function useCategoriaFinanceiraInsert() {
  const { mutate: insertCategoriaFinanceira, isPending, error } = useApiMutation<
    CategoriaFinanceiraFormData,
    CategoriaFinanceira
  >({
    mutationFn: createCategoriaFinanceira,
    errorMessage: "Erro ao cadastrar categoria financeira",
  });

  return { insertCategoriaFinanceira, isPending, error };
}

export function useCategoriaFinanceiraUpdate() {
  const { mutate, isPending, error } = useApiMutation<
    { id: number; payload: CategoriaFinanceiraFormData },
    CategoriaFinanceira
  >({
    mutationFn: ({ id, payload }) => updateCategoriaFinanceira(id, payload),
    errorMessage: "Erro ao atualizar categoria financeira",
  });

  const update = (id: number, payload: CategoriaFinanceiraFormData) => mutate({ id, payload });

  return { updateCategoriaFinanceira: update, isPending, error };
}

export function useCategoriaFinanceiraSetActive() {
  const { mutate, isPending, error } = useApiMutation<{ id: number; active: boolean }, CategoriaFinanceira>({
    mutationFn: ({ id, active }) => setCategoriaFinanceiraActive(id, active),
    errorMessage: "Erro ao atualizar status da categoria financeira",
  });

  const setActive = (id: number, active: boolean) => mutate({ id, active });

  return { setCategoriaFinanceiraActive: setActive, isPending, error };
}
