"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import api from "@/lib/api";
import { Patient } from "@/types";
import { PacientePayload } from "../../schemas/paciente.schema";

export function usePacienteUpdate() {
  const { mutate, isPending, error } = useApiMutation<
    { id: number; payload: PacientePayload },
    Patient
  >({
    mutationFn: ({ id, payload }) =>
      api.put<Patient>(`/api/patients/${id}`, payload).then((r) => r.data),
    errorMessage: "Erro ao atualizar paciente. Tente novamente.",
  });

  // Mantém a assinatura original: updatePaciente(id, payload)
  const updatePaciente = (id: number, payload: PacientePayload) =>
    mutate({ id, payload });

  return { updatePaciente, isPending, error };
}
