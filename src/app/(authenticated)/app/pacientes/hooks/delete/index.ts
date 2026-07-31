"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { deletePatient } from "@/app/(authenticated)/app/pacientes/services/patients.service";

export function usePacienteDelete() {
  const { mutate: deletePaciente, isPending, error } = useApiMutation<number, void>({
    mutationFn: deletePatient,
    errorMessage: "Erro ao excluir paciente. Tente novamente.",
  });
  return { deletePaciente, isPending, error };
}
