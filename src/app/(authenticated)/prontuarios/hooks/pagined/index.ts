"use client";

import { createPaginatedHook } from "@/lib/hooks/createPaginatedHook";
import { MedicalRecord } from "@/types";

export interface ProntuarioFilters {
  patientId?: number;
  patientName?: string;
  userId?: number;
  createdAt?: string;
}

export const useProntuariosPaginated = createPaginatedHook<MedicalRecord, ProntuarioFilters>({
  endpoint: "/api/medicalrecords",
  buildParams: (search, filters) => {
    const params = new URLSearchParams();
    if (search) params.append("patientName", search);
    if (filters.patientId) params.append("patientId", String(filters.patientId));
    if (filters.patientName) params.append("patientName", filters.patientName);
    if (filters.userId) params.append("userId", String(filters.userId));
    if (filters.createdAt) params.append("createdAt", filters.createdAt);
    return params;
  },
  errorMessage: "Erro ao carregar prontuários. Verifique sua conexão.",
});
