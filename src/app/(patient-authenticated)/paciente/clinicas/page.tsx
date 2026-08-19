"use client";

import { Building2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ClinicCard } from "../components/ClinicCard";
import { useMyClinics } from "../hooks/usePatientPortal";

export default function PatientClinicsPage() {
  const { data, isLoading, isError, refetch } = useMyClinics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a] dark:text-white">Minhas clínicas</h1>
        <p className="mt-1 text-sm text-[#64748b] dark:text-slate-400">
          Clínicas às quais você está vinculado(a).
        </p>
      </div>

      {isLoading && (
        <p className="py-8 text-center text-sm text-[#64748b] dark:text-slate-400">Carregando...</p>
      )}

      {isError && !isLoading && (
        <ErrorState message="Não foi possível carregar suas clínicas." onRetry={() => void refetch()} />
      )}

      {!isLoading && !isError && (data?.length ?? 0) === 0 && (
        <EmptyState
          icon={Building2}
          title="Nenhuma clínica vinculada"
          description="Quando uma clínica vincular seu cadastro, ela aparecerá aqui."
        />
      )}

      {!isLoading && !isError && (data?.length ?? 0) > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data!.map((clinic) => (
            <ClinicCard key={clinic.id} clinic={clinic} />
          ))}
        </div>
      )}
    </div>
  );
}
