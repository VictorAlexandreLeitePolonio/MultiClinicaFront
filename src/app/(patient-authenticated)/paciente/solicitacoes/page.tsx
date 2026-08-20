"use client";

import { ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * Rota reservada para as solicitações de consulta. A listagem, criação e
 * cancelamento são implementados na FRONT-4; aqui fica apenas o ponto de
 * navegação para não quebrar o shell do paciente.
 */
export default function PatientRequestsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0f172a] dark:text-white">Solicitações</h1>
      <EmptyState
        icon={ClipboardList}
        title="Em breve"
        description="As solicitações de consulta estarão disponíveis aqui em breve."
      />
    </div>
  );
}
