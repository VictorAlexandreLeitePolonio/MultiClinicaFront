"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import api from "@/lib/api";
import { User } from "@/types";
import { UsuarioFormData } from "../../schemas/usuario.schema";

export function useUsuarioInsert() {
  const { mutate: insertUsuario, isPending, error } = useApiMutation<
    UsuarioFormData & { password: string },
    User
  >({
    mutationFn: (payload) => api.post<User>("/api/users", payload).then((r) => r.data),
    errorMessage: "Erro ao cadastrar usuário",
  });
  return { insertUsuario, isPending, error };
}
