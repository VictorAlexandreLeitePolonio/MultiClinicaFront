"use client";

import { createPaginatedHook } from "@/lib/hooks/createPaginatedHook";
import { Plan } from "@/types";

// Planos não têm filtros além de busca por nome
export const usePlanosPaginated = createPaginatedHook<Plan>({
  endpoint: "/api/plans",
  buildParams: (search) => {
    const params = new URLSearchParams();
    if (search) params.append("name", search);
    return params;
  },
  errorMessage: "Erro ao carregar planos. Verifique sua conexão.",
});
