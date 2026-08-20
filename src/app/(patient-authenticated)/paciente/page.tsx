"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { usePatientAuth } from "@/contexts/PatientAuthContext";

/**
 * Landing mínima do portal autenticado. Serve como âncora da sessão do paciente
 * na FRONT-2; o dashboard completo (indicadores, próxima consulta etc.) é
 * construído na FRONT-3.
 */
export default function PatientHomePage() {
  const { patient, logout } = usePatientAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/paciente/login");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <div className="rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-xl font-bold text-[#0f172a] dark:text-white">
          Olá{patient?.name ? `, ${patient.name}` : ""}!
        </h1>
        <p className="mt-1 text-sm text-[#64748b] dark:text-slate-400">
          Bem-vindo(a) ao portal do paciente MultiClínica.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/paciente/alterar-senha">
            <Button variant="outline" fullWidth={false}>
              <KeyRound size={16} />
              Alterar senha
            </Button>
          </Link>
          <Button variant="secondary" fullWidth={false} onClick={handleLogout}>
            <LogOut size={16} />
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
}
