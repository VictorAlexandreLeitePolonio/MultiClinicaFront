"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import api from "@/lib/api";
import { Patient } from "@/types";
import { PacientePayload } from "../../schemas/paciente.schema";

export function usePacienteInsert() {
  const { mutate: insertPaciente, isPending, error } = useApiMutation<PacientePayload, Patient>({
    mutationFn: (payload) => api.post<Patient>("/api/patients", payload).then((r) => r.data),
    errorMessage: "Erro ao cadastrar paciente. Tente novamente.",
  });
  return { insertPaciente, isPending, error };
}
