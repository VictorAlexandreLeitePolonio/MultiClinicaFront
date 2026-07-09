"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import {
  createFormaPagamento,
  getFormasPagamento,
  setFormaPagamentoActive,
  updateFormaPagamento,
} from "@/services/formasPagamento/formasPagamento.service";
import { FormaPagamento, PagedResult } from "@/types";
import { getApiErrorMessage } from "@/utils/apiError";
import { FormaPagamentoFormData } from "../schemas/formaPagamento.schema";

export function useFormasPagamentoPaginated() {
  const [result, setResult] = useState<PagedResult<FormaPagamento>>({
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
        const data = await getFormasPagamento({
          nome: currentSearch || undefined,
          page: currentPage,
          pageSize: currentPageSize,
        });
        setResult(data);
      } catch (err) {
        const message = getApiErrorMessage(err, "Erro ao carregar formas de pagamento.");
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

export function useFormaPagamentoInsert() {
  const { mutate: insertFormaPagamento, isPending, error } = useApiMutation<FormaPagamentoFormData, FormaPagamento>({
    mutationFn: createFormaPagamento,
    errorMessage: "Erro ao cadastrar forma de pagamento",
  });

  return { insertFormaPagamento, isPending, error };
}

export function useFormaPagamentoUpdate() {
  const { mutate, isPending, error } = useApiMutation<
    { id: number; payload: FormaPagamentoFormData },
    FormaPagamento
  >({
    mutationFn: ({ id, payload }) => updateFormaPagamento(id, payload),
    errorMessage: "Erro ao atualizar forma de pagamento",
  });

  const update = (id: number, payload: FormaPagamentoFormData) => mutate({ id, payload });

  return { updateFormaPagamento: update, isPending, error };
}

export function useFormaPagamentoSetActive() {
  const { mutate, isPending, error } = useApiMutation<{ id: number; active: boolean }, FormaPagamento>({
    mutationFn: ({ id, active }) => setFormaPagamentoActive(id, active),
    errorMessage: "Erro ao atualizar status da forma de pagamento",
  });

  const setActive = (id: number, active: boolean) => mutate({ id, active });

  return { setFormaPagamentoActive: setActive, isPending, error };
}
