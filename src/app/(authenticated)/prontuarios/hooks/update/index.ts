"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import api from "@/lib/api";
import { MedicalRecord } from "@/types";

export interface UpdateMedicalRecordDto {
  titulo?: string;
  patologia?: string;
  queixaPrincipal?: string;
  examesImagem?: string;
  doencaAntiga?: string;
  doencaAtual?: string;
  habitos?: string;
  examesFisicos?: string;
  sinaisVitais?: string;
  medicamentos?: string;
  cirurgias?: string;
  outrasDoencas?: string;
  sessao?: string;
  orientacaoDomiciliar?: string;
}

export function useProntuarioUpdate() {
  const { mutate, isPending, error } = useApiMutation<
    { id: number; data: UpdateMedicalRecordDto },
    MedicalRecord
  >({
    mutationFn: ({ id, data }) =>
      api.put<MedicalRecord>(`/api/medicalrecords/${id}`, data).then((r) => r.data),
    errorMessage: "Erro ao atualizar prontuário.",
  });

  // Mantém a assinatura original: updateProntuario(id, data) → MedicalRecord | null
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
