"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { deletePlan } from "@/services/plans/plans.service";

export function usePlanoDelete() {
  const { mutate: deletePlano, isPending, error } = useApiMutation<number, void>({
    mutationFn: deletePlan,
    errorMessage: "Erro ao excluir plano",
  });
  return { deletePlano, isPending, error };
}
