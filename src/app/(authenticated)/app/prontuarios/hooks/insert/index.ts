"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import {
  createMedicalRecord,
  type CreateMedicalRecordDto,
} from "@/services/medical-records/medical-records.service";
import { MedicalRecord } from "@/types";

export type { CreateMedicalRecordDto };

export function useInsertProntuario() {
  const { mutate: insertProntuario, isPending, error } = useApiMutation<
    CreateMedicalRecordDto,
    MedicalRecord
  >({
    mutationFn: createMedicalRecord,
    errorMessage: "Erro ao criar prontuário.",
  });

  const insertProntuarioWrapper = async (data: CreateMedicalRecordDto): Promise<MedicalRecord | null> => {
    try {
      return await insertProntuario(data);
    } catch {
      return null;
    }
  };

  return { insertProntuario: insertProntuarioWrapper, isPending, error };
}
