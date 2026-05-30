"use client";

import api from "@/lib/api";
import axios from "axios";
import Cookies from "js-cookie";
import { useState } from "react";
import { User } from "@/types";

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginApiResponse {
  message: string;
  user: User;
}

interface UseLoginReturn {
  loginUser: (payload: LoginPayload) => Promise<{
    success: boolean;
    user?: User;
    error?: string;
  }>;
  loading: boolean;
  error: string | null;
}

const COOKIE_OPTIONS = {
  expires: 1 / 3,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
};

export const useLogin = (): UseLoginReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginUser = async (payload: LoginPayload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post<LoginApiResponse>("/api/Auth/login", payload);
      const { user } = response.data;

      Cookies.set("auth_user", JSON.stringify(user), COOKIE_OPTIONS);

      return { success: true, user };
    } catch (err) {
      // Usar axios.isAxiosError para validação em runtime (não cast inseguro)
      const errorMessage =
        axios.isAxiosError(err) && err.response?.status === 401
          ? "E-mail ou senha inválidos."
          : "Erro de conexão. Tente novamente.";

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { loginUser, loading, error };
};
