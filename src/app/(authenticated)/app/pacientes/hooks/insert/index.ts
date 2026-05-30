"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { Patient } from "@/types";
import { PacientePayload } from "../../schemas/paciente.schema";
import { createPatient } from "@/services/patients/patients.service";

export function usePacienteInsert() {
  const { mutate: insertPaciente, isPending, error } = useApiMutation<PacientePayload, Patient>({
    mutationFn: createPatient,
    errorMessage: "Erro ao cadastrar paciente. Tente novamente.",
  });
  return { insertPaciente, isPending, error };
}
