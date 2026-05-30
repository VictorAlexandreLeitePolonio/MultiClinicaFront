"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import api from "@/lib/api";
import { Plan } from "@/types";
import { PlanoFormData } from "../../schemas/plano.schema";

export function usePlanoInsert() {
  const { mutate: insertPlano, isPending, error } = useApiMutation<PlanoFormData, Plan>({
    mutationFn: (payload) => api.post<Plan>("/api/plans", payload).then((r) => r.data),
    errorMessage: "Erro ao cadastrar plano",
  });
  return { insertPlano, isPending, error };
}
