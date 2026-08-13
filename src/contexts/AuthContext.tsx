"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AuthResponse, AuthTenant, User } from "@/types";
import { getCurrentUser } from "@/app/(public)/login/services/auth.service";

interface AuthState {
  user: User | null;
  tenant: AuthTenant | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType {
  user: User | null;
  tenant: AuthTenant | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  initialLoading: boolean;
  setUser: (user: User | null) => void;
  setAuth: (auth: AuthResponse) => void;
  updateTenant: (tenant: AuthTenant | null) => void;
  refreshUser: () => Promise<User | null>;
  can: (permission: string) => boolean;
}

const emptyAuthState: AuthState = {
  user: null,
  tenant: null,
  permissions: [],
  isAuthenticated: false,
  isLoading: true,
};

const AuthContext = createContext<AuthContextType>({
  ...emptyAuthState,
  initialLoading: true,
  setUser: () => undefined,
  setAuth: () => undefined,
  updateTenant: () => undefined,
  refreshUser: async () => null,
  can: () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(emptyAuthState);

  const applyAuth = (auth: AuthResponse) => {
    setAuthState({
      user: auth.user,
      tenant: auth.tenant,
      permissions: auth.permissions,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const refreshUser = async () => {
    try {
      const auth = await getCurrentUser();
      applyAuth(auth);
      return auth.user;
    } catch {
      setAuthState({ ...emptyAuthState, isLoading: false });
      return null;
    }
  };

  useEffect(() => {
    let isActive = true;

    async function loadCurrentUser() {
      try {
        const auth = await getCurrentUser();
        if (isActive) {
          applyAuth(auth);
        }
      } catch {
        if (isActive) {
          setAuthState({ ...emptyAuthState, isLoading: false });
        }
      } finally {
        if (isActive) {
          setAuthState((current) => ({ ...current, isLoading: false }));
        }
      }
    }

    void loadCurrentUser();

    return () => {
      isActive = false;
    };
  }, []);

  const setUser = (u: User | null) => {
    if (!u) {
      setAuthState({ ...emptyAuthState, isLoading: false });
      return;
    }

    setAuthState((current) => ({
      ...current,
      user: u,
      isAuthenticated: true,
      isLoading: false,
    }));
  };

  const setAuth = (auth: AuthResponse) => applyAuth(auth);

  const updateTenant = (tenant: AuthTenant | null) => {
    setAuthState((current) => ({
      ...current,
      tenant,
      user: current.user
        ? {
            ...current.user,
            clinicId: tenant?.id ?? null,
            clinicName: tenant?.displayName ?? null,
          }
        : null,
    }));
  };

  const can = (permission: string) => authState.permissions.includes(permission);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        initialLoading: authState.isLoading,
        setUser,
        setAuth,
        updateTenant,
        refreshUser,
        can,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
