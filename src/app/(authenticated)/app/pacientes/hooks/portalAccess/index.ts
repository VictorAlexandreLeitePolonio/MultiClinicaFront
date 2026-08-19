"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { PatientCreatedResponse } from "@/types";
import {
  provisionPortalAccess,
  resendPortalInvite,
} from "@/app/(authenticated)/app/pacientes/services/patients.service";

/** Cria acesso ao portal para um paciente legado (POST /portal-access). */
export function useProvisionPortalAccess() {
  const { mutate, isPending, error } = useApiMutation<number, PatientCreatedResponse>({
    mutationFn: provisionPortalAccess,
    errorMessage: "Erro ao criar acesso ao portal. Tente novamente.",
  });
  return { provisionPortalAccess: mutate, isPending, error };
}

/** Reenvia o convite de ativação de um paciente pendente (POST /resend-invite). */
export function useResendPortalInvite() {
  const { mutate, isPending, error } = useApiMutation<number, PatientCreatedResponse>({
    mutationFn: resendPortalInvite,
    errorMessage: "Erro ao reenviar o convite. Tente novamente.",
  });
  return { resendPortalInvite: mutate, isPending, error };
}
