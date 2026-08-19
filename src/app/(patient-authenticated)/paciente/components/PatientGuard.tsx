"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { usePatientAuth } from "@/contexts/PatientAuthContext";

/**
 * Protege as rotas do portal autenticado. Baseia-se exclusivamente no
 * PatientAuthContext — nunca no AuthContext operacional da clínica.
 */
export function PatientGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = usePatientAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/paciente/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0fdf9] dark:bg-slate-950">
        <p className="text-sm text-[#64748b] dark:text-slate-400">Carregando...</p>
      </div>
    );
  }

  return <>{children}</>;
}
