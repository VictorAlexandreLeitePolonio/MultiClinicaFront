"use client";

import { Receipt } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PatientCharge } from "@/types/mercadoPago";
import { ChargeCard } from "./components/ChargeCard";
import { useMyCharges } from "./hooks/usePatientCharges";

// Pendentes primeiro; dentro de cada grupo vale a ordem do back (mais recentes).
const STATUS_ORDER: Record<PatientCharge["status"], number> = { Pending: 0, Paid: 1 };

export default function PatientChargesPage() {
  const query = useMyCharges();
  const charges = [...(query.data ?? [])].sort(
    (left, right) => STATUS_ORDER[left.status] - STATUS_ORDER[right.status],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a] dark:text-white">Minhas cobranças</h1>
        <p className="mt-1 text-sm text-[#64748b] dark:text-slate-400">
          Pague as cobranças da sua clínica por Pix ou cartão.
        </p>
      </div>

      {query.isLoading && (
        <p className="py-8 text-center text-sm text-[#64748b] dark:text-slate-400">Carregando...</p>
      )}

      {query.isError && !query.isLoading && (
        <ErrorState
          message="Não foi possível carregar suas cobranças."
          onRetry={() => void query.refetch()}
        />
      )}

      {!query.isLoading && !query.isError && charges.length === 0 && (
        <EmptyState
          icon={Receipt}
          title="Nenhuma cobrança por aqui."
          description="Quando a clínica enviar uma cobrança, ela aparecerá aqui."
        />
      )}

      {!query.isLoading && !query.isError && charges.length > 0 && (
        <div className="space-y-3">
          {charges.map((charge) => (
            <ChargeCard key={charge.id} charge={charge} />
          ))}
        </div>
      )}
    </div>
  );
}
