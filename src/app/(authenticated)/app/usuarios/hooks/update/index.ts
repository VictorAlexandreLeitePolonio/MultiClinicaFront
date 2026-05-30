"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { User } from "@/types";
import { UsuarioFormData } from "../../schemas/usuario.schema";
import { updateUser } from "@/services/users/users.service";

export function useUsuarioUpdate() {
  const { mutate, isPending, error } = useApiMutation<
    { id: number; payload: Partial<UsuarioFormData> },
    User
  >({
    mutationFn: ({ id, payload }) => updateUser(id, payload),
    errorMessage: "Erro ao atualizar usuário",
  });

  // Mantém a assinatura original: updateUsuario(id, payload)
  const updateUsuario = (id: number, payload: Partial<UsuarioFormData>) =>
    mutate({ id, payload });

  return { updateUsuario, isPending, error };
}
