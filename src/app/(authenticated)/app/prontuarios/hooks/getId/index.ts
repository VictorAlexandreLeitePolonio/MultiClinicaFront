"use client";

import { useState, useCallback, useEffect } from "react";
import { getMedicalRecordById } from "@/services/medical-records/medical-records.service";
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
      const response = await getMedicalRecordById(targetId);
      setRecord(response);
    } catch {
      const msg = "Erro ao carregar dados. Verifique sua conexão.";
      setError(msg);
      toast.error(msg);
      setRecord(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchById();
    }
  }, [id, fetchById]);

  return { record, loading, error, fetchById };
}
