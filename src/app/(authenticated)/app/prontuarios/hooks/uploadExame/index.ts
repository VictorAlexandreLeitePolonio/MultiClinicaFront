"use client";

import { useState } from "react";
import { toast } from "sonner";
import { uploadMedicalRecordAttachment } from "@/services/attachments/attachments.service";
import { getApiErrorMessage } from "@/utils/apiError";
import { ClinicalAttachment } from "@/types";

export function useUploadExame() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadExame = async (
    medicalRecordId: number,
    patientId: number,
    file: File
  ): Promise<ClinicalAttachment | null> => {
    setLoading(true);
    setError(null);
    try {
      return await uploadMedicalRecordAttachment({
        medicalRecordId,
        patientId,
        type: "Exam",
        file,
      });
    } catch (err) {
      const message = getApiErrorMessage(err, "Erro ao fazer upload do exame.");
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { uploadExame, loading, error };
}
