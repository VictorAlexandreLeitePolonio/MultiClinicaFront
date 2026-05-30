"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import api from "@/lib/api";

export function usePacienteDelete() {
  const { mutate: deletePaciente, isPending, error } = useApiMutation<number, void>({
    mutationFn: (id) => api.delete(`/api/patients/${id}`).then(() => undefined),
    errorMessage: "Erro ao excluir paciente. Tente novamente.",
  });
  return { deletePaciente, isPending, error };
}
