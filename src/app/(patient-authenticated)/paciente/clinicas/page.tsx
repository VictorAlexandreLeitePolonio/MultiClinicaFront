"use client";

import { useState } from "react";
import { Building2, CalendarPlus } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import { PatientClinic } from "@/types";
import { ClinicCard } from "../components/ClinicCard";
import { RequestAppointmentModal } from "../components/RequestAppointmentModal";
import { useMyClinics } from "../hooks/usePatientPortal";

export default function PatientClinicsPage() {
  const { data, isLoading, isError, refetch } = useMyClinics();
  const [requestClinic, setRequestClinic] = useState<PatientClinic | null>(null);

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
            <div key={clinic.id} className="flex flex-col gap-2">
              <ClinicCard clinic={clinic} />
              {clinic.acceptsAppointmentRequests && (
                <Button variant="outline" fullWidth={false} onClick={() => setRequestClinic(clinic)}>
                  <CalendarPlus size={16} />
                  Solicitar consulta
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {requestClinic && (
        <RequestAppointmentModal
          open
          clinicId={requestClinic.id}
          clinicName={requestClinic.displayName}
          onClose={() => setRequestClinic(null)}
          onRequestsDisabled={() => {
            setRequestClinic(null);
            void refetch();
          }}
        />
      )}
    </div>
  );
}
