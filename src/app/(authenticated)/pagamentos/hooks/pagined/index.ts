"use client";

import { createPaginatedHook } from "@/lib/hooks/createPaginatedHook";
import { Payment } from "@/types";

export interface PagamentoFilters {
  patientId?: string;
  status?: string;
}

export const usePagamentosPaginated = createPaginatedHook<Payment, PagamentoFilters>({
  endpoint: "/api/payments",
  buildParams: (search, filters) => {
    const params = new URLSearchParams();
    if (search) params.append("patientName", search);
    if (filters.patientId) params.append("patientId", filters.patientId);
    if (filters.status) params.append("status", filters.status);
    return params;
  },
  errorMessage: "Erro ao carregar pagamentos. Verifique sua conexão.",
});
