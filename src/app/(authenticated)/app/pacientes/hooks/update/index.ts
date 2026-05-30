"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { Patient } from "@/types";
import { PacientePayload } from "../../schemas/paciente.schema";
import { updatePatient } from "@/services/patients/patients.service";

export function usePacienteUpdate() {
  const { mutate, isPending, error } = useApiMutation<
    { id: number; payload: PacientePayload },
    Patient
  >({
    mutationFn: ({ id, payload }) => updatePatient(id, payload),
    errorMessage: "Erro ao atualizar paciente. Tente novamente.",
  });

  // Mantém a assinatura original: updatePaciente(id, payload)
  const updatePaciente = (id: number, payload: PacientePayload) =>
    mutate({ id, payload });

  return { updatePaciente, isPending, error };
}
