"use client";

import { useState } from "react";
import { toast } from "sonner";
import { uploadMedicalRecordExame } from "@/services/attachments/attachments.service";
import { getApiErrorMessage } from "@/utils/apiError";

export function useUploadExame() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadExame = async (id: number, file: File): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      return await uploadMedicalRecordExame(id, file);
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
