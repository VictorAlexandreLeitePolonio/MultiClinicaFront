"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import api from "@/lib/api";

export function usePlanoDelete() {
  const { mutate: deletePlano, isPending, error } = useApiMutation<number, void>({
    mutationFn: (id) => api.delete(`/api/plans/${id}`).then(() => undefined),
    errorMessage: "Erro ao excluir plano",
  });
  return { deletePlano, isPending, error };
}
