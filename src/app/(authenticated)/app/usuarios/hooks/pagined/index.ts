"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { PagedResult, User } from "@/types";
import { getUsers } from "@/services/users/users.service";
import { getApiErrorMessage } from "@/utils/apiError";

export function useUsuariosPaginated() {
  const [result, setResult] = useState<PagedResult<User>>({
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

  const fetchUsers = useCallback(
    async (currentSearch: string, currentPage: number, currentPageSize: number) => {
      setLoading(true);
      setError(null);
      try {
        const users = await getUsers({
          name: currentSearch || undefined,
          page: currentPage,
          pageSize: currentPageSize,
        });
        setResult(users);
      } catch (err) {
        const message = getApiErrorMessage(err, "Erro ao carregar usuários. Verifique sua conexão.");
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
      () => fetchUsers(search, page, pageSize),
      400
    );
    return () => clearTimeout(timer);
  }, [search, page, pageSize, fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  const refetch = useCallback(
    () => fetchUsers(search, page, pageSize),
    [fetchUsers, search, page, pageSize]
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
