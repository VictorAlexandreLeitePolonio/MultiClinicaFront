"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { User } from "@/types";
import { UsuarioCreateFormData } from "../../schemas/usuario.schema";
import { createUser } from "@/app/(authenticated)/app/usuarios/services/users.service";

export function useUsuarioInsert() {
  const { mutate: insertUsuario, isPending, error } = useApiMutation<
    UsuarioCreateFormData,
    User
  >({
    mutationFn: createUser,
    errorMessage: "Erro ao cadastrar usuário",
  });
  return { insertUsuario, isPending, error };
}
