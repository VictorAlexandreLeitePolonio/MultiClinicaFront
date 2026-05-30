"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import api from "@/lib/api";
import { Plan } from "@/types";
import { PlanoFormData } from "../../schemas/plano.schema";

export function usePlanoUpdate() {
  const { mutate, isPending, error } = useApiMutation<
    { id: number; payload: PlanoFormData },
    Plan
  >({
    mutationFn: ({ id, payload }) =>
      api.put<Plan>(`/api/plans/${id}`, payload).then((r) => r.data),
    errorMessage: "Erro ao atualizar plano",
  });

  // Mantém a assinatura original: updatePlano(id, payload)
  const updatePlano = (id: number, payload: PlanoFormData) =>
    mutate({ id, payload });

  return { updatePlano, isPending, error };
}
