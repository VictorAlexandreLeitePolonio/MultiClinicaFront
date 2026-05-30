"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  initialLoading: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const COOKIE_OPTIONS = {
  expires: 1 / 3, // 8 horas
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Lê o cookie somente no cliente (após hidratação)
  useEffect(() => {
    const stored = Cookies.get("auth_user");
    if (stored) {
      try {
        setUserState(JSON.parse(stored));
      } catch {
        Cookies.remove("auth_user");
      }
    }
    setInitialLoading(false);
  }, []);

  const setUser = (u: User | null) => {
    setUserState(u);
    if (u) {
      Cookies.set("auth_user", JSON.stringify(u), COOKIE_OPTIONS);
    } else {
      Cookies.remove("auth_user");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        initialLoading,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
