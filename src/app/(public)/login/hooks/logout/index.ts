"use client";

import Cookies from "js-cookie";
import { useState } from "react";

interface UseLogoutReturn {
  logoutUser: () => Promise<{ success: boolean }>;
  loading: boolean;
}

export const useLogout = (): UseLogoutReturn => {
  const [loading, setLoading] = useState(false);

  const logoutUser = async () => {
    setLoading(true);
    try {
      Cookies.remove("auth_user");
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  return { logoutUser, loading };
};
