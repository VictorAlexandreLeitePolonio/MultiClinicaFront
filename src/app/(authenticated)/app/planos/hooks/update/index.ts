"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { Plan } from "@/types";
import { PlanoFormData } from "../../schemas/plano.schema";
import { updatePlan } from "@/app/(authenticated)/app/planos/services/plans.service";

export function usePlanoUpdate() {
  const { mutate, isPending, error } = useApiMutation<
    { id: number; payload: PlanoFormData },
    Plan
  >({
    mutationFn: ({ id, payload }) => updatePlan(id, payload),
    errorMessage: "Erro ao atualizar plano",
  });

  // Mantém a assinatura original: updatePlano(id, payload)
  const updatePlano = (id: number, payload: PlanoFormData) =>
    mutate({ id, payload });

  return { updatePlano, isPending, error };
}
