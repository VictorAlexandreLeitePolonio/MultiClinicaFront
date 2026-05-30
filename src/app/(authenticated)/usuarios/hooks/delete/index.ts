"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import api from "@/lib/api";

export function useUsuarioDelete() {
  const { mutate: deleteUsuario, isPending, error } = useApiMutation<number, void>({
    mutationFn: (id) => api.delete(`/api/users/${id}`).then(() => undefined),
    errorMessage: "Erro ao excluir usuário",
  });
  return { deleteUsuario, isPending, error };
}
