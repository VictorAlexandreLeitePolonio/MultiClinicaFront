"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { getCurrentUser } from "@/services/auth/auth.service";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  initialLoading: boolean;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUserState(currentUser);
      return currentUser;
    } catch {
      setUserState(null);
      return null;
    }
  };

  useEffect(() => {
    let isActive = true;

    async function loadCurrentUser() {
      try {
        const currentUser = await getCurrentUser();
        if (isActive) {
          setUserState(currentUser);
        }
      } catch {
        if (isActive) {
          setUserState(null);
        }
      } finally {
        if (isActive) {
          setInitialLoading(false);
        }
      }
    }

    void loadCurrentUser();

    return () => {
      isActive = false;
    };
  }, []);

  const setUser = (u: User | null) => {
    setUserState(u);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        initialLoading,
        setUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
