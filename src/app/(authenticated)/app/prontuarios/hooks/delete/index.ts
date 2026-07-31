"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { deleteMedicalRecord } from "@/app/(authenticated)/app/prontuarios/services/medical-records.service";

export function useProntuarioDelete() {
  const { mutate: deleteProntuario, isPending, error } = useApiMutation<number, void>({
    mutationFn: deleteMedicalRecord,
    errorMessage: "Erro ao excluir prontuário.",
  });
  return { deleteProntuario, isPending, error };
}
