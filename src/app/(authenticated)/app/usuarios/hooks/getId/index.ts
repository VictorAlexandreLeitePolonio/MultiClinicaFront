"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { User } from "@/types";
import { getUserById } from "@/services/users/users.service";

export function useUsuarioById(id: number | null) {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuario = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const user = await getUserById(id);
      setData(user);
    } catch {
      const msg = "Erro ao carregar dados. Verifique sua conexão.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchUsuario(); }, [fetchUsuario]);

  return { data, loading, error, refetch: fetchUsuario };
}
