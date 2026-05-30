"use client";

import { useState, useCallback, useEffect } from "react";
import api from "@/lib/api";
import { WhatsAppLogItem, PagedResult } from "@/types";
import { normalizePagedResult } from "@/lib/pagination";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";

export interface WhatsAppLogFilters {
  type?: string;
  success?: boolean;
  patientId?: number;
}

export function usePaginedWhatsAppLogs() {
  const [result, setResult] = useState<PagedResult<WhatsAppLogItem>>({
    data: [],
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<WhatsAppLogFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const fetchLogs = useCallback(async (
    activeFilters?: WhatsAppLogFilters,
    currentPage?: number,
    currentPageSize?: number
  ) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeFilters?.type) {
        params.append("type", activeFilters.type);
      }
      if (activeFilters?.success !== undefined) {
        params.append("success", String(activeFilters.success));
      }
      if (activeFilters?.patientId) {
        params.append("patientId", String(activeFilters.patientId));
      }
      params.append("page", (currentPage ?? page).toString());
      params.append("pageSize", (currentPageSize ?? pageSize).toString());
      const response = await api.get<PagedResult<WhatsAppLogItem> | WhatsAppLogItem[]>(`/api/whatsapplogs?${params.toString()}`);
      setResult(normalizePagedResult<WhatsAppLogItem>(response.data, currentPageSize ?? pageSize));
    } catch (err) {
      const message = getApiErrorMessage(err, "Erro ao carregar logs do WhatsApp.");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchLogs(filters, page, pageSize);
  }, [filters, page, pageSize, fetchLogs]);

  // Resetar para página 1 quando filtros ou pageSize mudarem
  useEffect(() => {
    setPage(1);
  }, [filters, pageSize]);

  const refetch = useCallback(
    () => fetchLogs(filters, page, pageSize),
    [fetchLogs, filters, page, pageSize]
  );

  const applyFilters = useCallback((newFilters: WhatsAppLogFilters) => {
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
    filters,
    applyFilters,
    clearFilters,
    refetch,
  };
}
