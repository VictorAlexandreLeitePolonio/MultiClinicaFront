"use client";

import { createPaginatedHook } from "@/lib/hooks/createPaginatedHook";
import { Patient } from "@/types";

export interface PacienteFilters {
  appointmentStatus?: string;
  paymentStatus?: string;
}

export const usePacientesPaginated = createPaginatedHook<Patient, PacienteFilters>({
  endpoint: "/api/patients",
  buildParams: (search, filters) => {
    const params = new URLSearchParams();
    if (search) params.append("name", search);
    if (filters.appointmentStatus) params.append("appointmentStatus", filters.appointmentStatus);
    if (filters.paymentStatus) params.append("paymentStatus", filters.paymentStatus);
    return params;
  },
  errorMessage: "Erro ao carregar pacientes. Verifique sua conexão.",
});
