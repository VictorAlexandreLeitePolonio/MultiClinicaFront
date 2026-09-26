"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { UsuarioInviteFormData } from "../../schemas/usuario.schema";
import { inviteUser, UserInvitationResponse } from "@/app/(authenticated)/app/usuarios/services/users.service";

export function useUsuarioInsert() {
  const { mutate: insertUsuario, isPending, error } = useApiMutation<
    UsuarioInviteFormData,
    UserInvitationResponse
  >({
    mutationFn: inviteUser,
    errorMessage: "Não foi possível criar o convite",
  });
  return { insertUsuario, isPending, error };
}
