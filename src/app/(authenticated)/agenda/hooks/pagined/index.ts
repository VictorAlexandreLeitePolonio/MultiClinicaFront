"use client";

import { createPaginatedHook } from "@/lib/hooks/createPaginatedHook";
import { Appointment } from "@/types";

export interface AgendaFilters {
  status?: string;
  patientId?: number;
}

export const useAgendaPaginated = createPaginatedHook<Appointment, AgendaFilters>({
  endpoint: "/api/appointments",
  buildParams: (search, filters) => {
    const params = new URLSearchParams();
    if (search) params.append("patientName", search);
    if (filters.status) params.append("status", filters.status);
    if (filters.patientId) params.append("patientId", String(filters.patientId));
    return params;
  },
  errorMessage: "Erro ao carregar agenda. Verifique sua conexão.",
});
