"use client";

import { useState } from "react";
import { toast } from "sonner";
import { uploadMedicalRecordContrato } from "@/services/attachments/attachments.service";
import { getApiErrorMessage } from "@/utils/apiError";

export function useUploadContrato() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadContrato = async (id: number, file: File): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      return await uploadMedicalRecordContrato(id, file);
    } catch (err) {
      const message = getApiErrorMessage(err, "Erro ao fazer upload do contrato.");
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { uploadContrato, loading, error };
}
