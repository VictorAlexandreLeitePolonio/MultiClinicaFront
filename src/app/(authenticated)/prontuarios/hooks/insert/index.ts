"use client";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import api from "@/lib/api";
import { MedicalRecord } from "@/types";

export interface CreateMedicalRecordDto {
  patientId: number;
  titulo: string;
  patologia: string;
  queixaPrincipal: string;
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

export function useInsertProntuario() {
  const { mutate: insertProntuario, isPending, error } = useApiMutation<
    CreateMedicalRecordDto,
    MedicalRecord
  >({
    mutationFn: (payload) =>
      api.post<MedicalRecord>("/api/medicalrecords", payload).then((r) => r.data),
    errorMessage: "Erro ao criar prontuário.",
  });

  // Wrapper para manter compatibilidade com retorno null em caso de erro
  const insertProntuarioWrapper = async (data: CreateMedicalRecordDto): Promise<MedicalRecord | null> => {
    try {
      return await insertProntuario(data);
    } catch {
      return null;
    }
  };

  return { insertProntuario: insertProntuarioWrapper, isPending, error };
}
