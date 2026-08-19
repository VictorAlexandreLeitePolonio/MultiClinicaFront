"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { PatientSession } from "@/types";
import {
  login as loginRequest,
  logout as logoutRequest,
  me as meRequest,
} from "@/app/(patient-public)/paciente/services/patient-auth.service";

interface PatientAuthContextType {
  patient: PatientSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<PatientSession>;
  logout: () => Promise<void>;
  setPatient: (patient: PatientSession | null) => void;
  refresh: () => Promise<PatientSession | null>;
}

const PatientAuthContext = createContext<PatientAuthContextType>({
  patient: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {
    throw new Error("PatientAuthProvider ausente");
  },
  logout: async () => undefined,
  setPatient: () => undefined,
  refresh: async () => null,
});

export function PatientAuthProvider({ children }: { children: ReactNode }) {
  const [patient, setPatient] = useState<PatientSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    try {
      const session = await meRequest();
      setPatient(session);
      return session;
    } catch {
      setPatient(null);
      return null;
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const session = await meRequest();
        if (active) setPatient(session);
      } catch {
        if (active) setPatient(null);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const session = await loginRequest({ email, password });
    setPatient(session);
    return session;
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } finally {
      setPatient(null);
    }
  };

  return (
    <PatientAuthContext.Provider
      value={{
        patient,
        isAuthenticated: patient !== null,
        isLoading,
        login,
        logout,
        setPatient,
        refresh,
      }}
    >
      {children}
    </PatientAuthContext.Provider>
  );
}

export const usePatientAuth = () => useContext(PatientAuthContext);
