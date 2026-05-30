"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import {
  changePatientStatus,
  ChangePatientStatusResponse,
} from "@/services/patients/patients.service";

export function usePacienteChangeStatus() {
  const { mutate, isPending: loading, error } = useApiMutation<
    number,
    ChangePatientStatusResponse
  >({
    mutationFn: changePatientStatus,
    errorMessage: "Erro ao alterar status do paciente. Tente novamente.",
  });

  // Mantém a assinatura original: changeStatus(id) → { success, isActive }
  const changeStatus = async (id: number) => {
    const data = await mutate(id);
    return { success: true, isActive: data.isActive };
  };

  return { changeStatus, loading, error };
}
