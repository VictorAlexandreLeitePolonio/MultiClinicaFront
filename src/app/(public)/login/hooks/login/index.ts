"use client";

import { useState } from "react";
import { User } from "@/types";
import { getApiErrorMessage } from "@/utils/apiError";
import { login, LoginPayload } from "@/services/auth/auth.service";

interface UseLoginReturn {
  loginUser: (payload: LoginPayload) => Promise<{
    success: boolean;
    user?: User;
    error?: string;
  }>;
  loading: boolean;
  error: string | null;
}

export const useLogin = (): UseLoginReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginUser = async (payload: LoginPayload) => {
    setLoading(true);
    setError(null);

    try {
      const user = await login(payload);
      return { success: true, user };
    } catch (err) {
      const errorMessage = getApiErrorMessage(err, "Erro de conexão. Tente novamente.");
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { loginUser, loading, error };
};
