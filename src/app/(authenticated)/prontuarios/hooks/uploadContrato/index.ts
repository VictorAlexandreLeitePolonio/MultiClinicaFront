"use client";

import { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";

interface UploadResponse {
  url: string;
}

export function useUploadContrato() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadContrato = async (id: number, file: File): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await api.post<UploadResponse>(
        `/api/medicalrecords/${id}/contrato`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.url;
    } catch (err) {
      const message = getApiErrorMessage(err, "Erro ao fazer upload do contrato.");
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { uploadContrato, loading, error };
}
