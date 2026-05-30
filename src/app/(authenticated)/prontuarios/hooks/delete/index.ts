"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import api from "@/lib/api";

export function useProntuarioDelete() {
  const { mutate: deleteProntuario, isPending, error } = useApiMutation<number, void>({
    mutationFn: (id) => api.delete(`/api/medicalrecords/${id}`).then(() => undefined),
    errorMessage: "Erro ao excluir prontuário.",
  });
  return { deleteProntuario, isPending, error };
}
