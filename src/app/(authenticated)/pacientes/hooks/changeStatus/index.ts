"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import api from "@/lib/api";

export function usePacienteChangeStatus() {
  const { mutate, isPending: loading, error } = useApiMutation<
    number,
    { id: number; isActive: boolean }
  >({
    mutationFn: (id) =>
      api
        .patch<{ id: number; isActive: boolean }>(`/api/patients/${id}/status`)
        .then((r) => r.data),
    errorMessage: "Erro ao alterar status do paciente. Tente novamente.",
  });

  // Mantém a assinatura original: changeStatus(id) → { success, isActive }
  const changeStatus = async (id: number) => {
    const data = await mutate(id);
    return { success: true, isActive: data.isActive };
  };

  return { changeStatus, loading, error };
}
