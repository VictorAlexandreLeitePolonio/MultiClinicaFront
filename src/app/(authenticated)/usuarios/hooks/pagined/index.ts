"use client";

import { createPaginatedHook } from "@/lib/hooks/createPaginatedHook";
import { User } from "@/types";

// Usuários não têm filtros além de busca por nome
export const useUsuariosPaginated = createPaginatedHook<User>({
  endpoint: "/api/users",
  buildParams: (search) => {
    const params = new URLSearchParams();
    if (search) params.append("name", search);
    return params;
  },
  errorMessage: "Erro ao carregar usuários. Verifique sua conexão.",
});
