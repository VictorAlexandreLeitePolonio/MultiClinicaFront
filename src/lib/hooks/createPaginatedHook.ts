"use client";

import { useState, useCallback, useEffect } from "react";
import api from "@/lib/api";
import { PagedResult } from "@/types";
import { normalizePagedResult } from "@/lib/pagination";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";

interface PaginatedHookConfig<T, F> {
  /** Endpoint da API — ex: "/api/patients" */
  endpoint: string;
  /**
   * Constrói os URLSearchParams de busca e filtros.
   * NÃO inclua page/pageSize — a factory os adiciona automaticamente.
   */
  buildParams: (search: string, filters: F) => URLSearchParams;
  /** Mensagem de fallback para erros de carregamento */
  errorMessage: string;
}

/**
 * Factory que gera um hook paginado completo com debounce, filtros,
 * paginação e error handling — sem código duplicado.
 *
 * Uso:
 *   export const usePacientesPaginated = createPaginatedHook<Patient, PacienteFilters>({
 *     endpoint: "/api/patients",
 *     buildParams: (search, filters) => { ... },
 *     errorMessage: "Erro ao carregar pacientes.",
 *   });
 */
export function createPaginatedHook<T, F = Record<string, never>>(
  config: PaginatedHookConfig<T, F>
) {
  return function usePaginatedQuery(initialFilters?: F) {
    const [result, setResult] = useState<PagedResult<T>>({
      data: [],
      page: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState<F>((initialFilters ?? {}) as F);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Todos os parâmetros são passados explicitamente — sem stale closure
    const fetchData = useCallback(
      async (
        currentSearch: string,
        currentFilters: F,
        currentPage: number,
        currentPageSize: number
      ) => {
        setLoading(true);
        setError(null);
        try {
          const params = config.buildParams(currentSearch, currentFilters);
          params.append("page", currentPage.toString());
          params.append("pageSize", currentPageSize.toString());
          const response = await api.get<PagedResult<T> | T[]>(
            `${config.endpoint}?${params.toString()}`
          );
          setResult(normalizePagedResult<T>(response.data, currentPageSize));
        } catch (err) {
          const message = getApiErrorMessage(err, config.errorMessage);
          toast.error(message);
          setError(message);
        } finally {
          setLoading(false);
        }
      },
      // config é estável (criado uma vez por createPaginatedHook)
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    // Debounce de 400ms — igual ao padrão original
    useEffect(() => {
      const timer = setTimeout(
        () => fetchData(search, filters, page, pageSize),
        400
      );
      return () => clearTimeout(timer);
    }, [search, filters, page, pageSize, fetchData]);

    // Resetar para página 1 quando busca, filtros ou pageSize mudarem
    useEffect(() => {
      setPage(1);
    }, [search, filters, pageSize]);

    const refetch = useCallback(
      () => fetchData(search, filters, page, pageSize),
      [fetchData, search, filters, page, pageSize]
    );

    const applyFilters = useCallback(
      (newFilters: F) => setFilters(newFilters),
      []
    );

    const clearFilters = useCallback(() => setFilters({} as F), []);

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
  };
}
