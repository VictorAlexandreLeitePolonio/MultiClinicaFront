"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import {
  importPatients as uploadPatients,
  PatientImportResponse,
} from "@/app/(authenticated)/app/pacientes/services/patients.service";

interface ImportPatientFilePayload {
  file: File;
  idempotencyKey: string;
}

export function usePatientImport() {
  return useApiMutation<ImportPatientFilePayload, PatientImportResponse>({
    mutationFn: ({ file, idempotencyKey }) => uploadPatients(file, idempotencyKey),
    errorMessage: "Não foi possível importar os pacientes.",
  });
}
