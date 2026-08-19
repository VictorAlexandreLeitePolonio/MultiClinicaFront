"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { PatientCreatedResponse } from "@/types";
import { PacientePayload } from "../../schemas/paciente.schema";
import { createPatient } from "@/app/(authenticated)/app/pacientes/services/patients.service";

export function usePacienteInsert() {
  const { mutate: insertPaciente, isPending, error } = useApiMutation<PacientePayload, PatientCreatedResponse>({
    mutationFn: createPatient,
    errorMessage: "Erro ao cadastrar paciente. Tente novamente.",
  });
  return { insertPaciente, isPending, error };
}
