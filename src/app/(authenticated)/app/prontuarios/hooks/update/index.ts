"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import {
  updateMedicalRecord,
  type UpdateMedicalRecordDto,
} from "@/services/medical-records/medical-records.service";
import { MedicalRecord } from "@/types";

export type { UpdateMedicalRecordDto };

export function useProntuarioUpdate() {
  const { mutate, isPending, error } = useApiMutation<
    { id: number; data: UpdateMedicalRecordDto },
    MedicalRecord
  >({
    mutationFn: ({ id, data }) => updateMedicalRecord(id, data),
    errorMessage: "Erro ao atualizar prontuário.",
  });

  const updateProntuario = async (
    id: number,
    data: UpdateMedicalRecordDto
  ): Promise<MedicalRecord | null> => {
    try {
      return await mutate({ id, data });
    } catch {
      return null;
    }
  };

  return { updateProntuario, isPending, error };
}
