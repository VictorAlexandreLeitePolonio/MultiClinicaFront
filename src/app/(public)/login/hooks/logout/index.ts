"use client";

import { useState } from "react";
import { logout } from "@/services/auth/auth.service";

interface UseLogoutReturn {
  logoutUser: () => Promise<{ success: boolean }>;
  loading: boolean;
}

export const useLogout = (): UseLogoutReturn => {
  const [loading, setLoading] = useState(false);

  const logoutUser = async () => {
    setLoading(true);
    try {
      await logout();
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  return { logoutUser, loading };
};
