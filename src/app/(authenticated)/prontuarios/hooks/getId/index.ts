"use client";

import { useState, useCallback, useEffect } from "react";
import api from "@/lib/api";
import { MedicalRecord } from "@/types";
import { toast } from "sonner";

export function useProntuarioById(id?: number) {
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchById = useCallback(async (fetchId?: number) => {
    const targetId = fetchId ?? id;
    if (!targetId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<MedicalRecord>(`/api/medicalrecords/${targetId}`);
      setRecord(response.data);
    } catch {
      const msg = "Erro ao carregar dados. Verifique sua conexão.";
      setError(msg);
      toast.error(msg);
      setRecord(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Auto-fetch se id for passado no construtor
  useEffect(() => {
    if (id) {
      fetchById();
    }
  }, [id, fetchById]);

  return { record, loading, error, fetchById };
}
