"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { deleteUser } from "@/app/(authenticated)/app/usuarios/services/users.service";

export function useUsuarioDelete() {
  const { mutate: deleteUsuario, isPending, error } = useApiMutation<number, void>({
    mutationFn: deleteUser,
    errorMessage: "Erro ao excluir usuário",
  });
  return { deleteUsuario, isPending, error };
}
