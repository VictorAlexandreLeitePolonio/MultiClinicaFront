"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { Plan } from "@/types";
import { PlanoFormData } from "../../schemas/plano.schema";
import { createPlan } from "@/services/plans/plans.service";

export function usePlanoInsert() {
  const { mutate: insertPlano, isPending, error } = useApiMutation<PlanoFormData, Plan>({
    mutationFn: createPlan,
    errorMessage: "Erro ao cadastrar plano",
  });
  return { insertPlano, isPending, error };
}
