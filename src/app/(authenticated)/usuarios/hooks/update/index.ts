"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import api from "@/lib/api";
import { User } from "@/types";
import { UsuarioFormData } from "../../schemas/usuario.schema";

export function useUsuarioUpdate() {
  const { mutate, isPending, error } = useApiMutation<
    { id: number; payload: Partial<UsuarioFormData> },
    User
  >({
    mutationFn: ({ id, payload }) =>
      api.put<User>(`/api/users/${id}`, payload).then((r) => r.data),
    errorMessage: "Erro ao atualizar usuário",
  });

  // Mantém a assinatura original: updateUsuario(id, payload)
  const updateUsuario = (id: number, payload: Partial<UsuarioFormData>) =>
    mutate({ id, payload });

  return { updateUsuario, isPending, error };
}
