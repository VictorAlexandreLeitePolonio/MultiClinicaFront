"use client";

import Link from "next/link";
import { CalendarClock, CalendarCheck, ClipboardList, Building2 } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePatientAuth } from "@/contexts/PatientAuthContext";
import { AppointmentCard } from "./components/AppointmentCard";
import {
  useMyAppointmentRequests,
  useMyClinics,
  useUpcomingAppointments,
} from "./hooks/usePatientPortal";

export default function PatientDashboardPage() {
  const { patient } = usePatientAuth();
  const upcoming = useUpcomingAppointments();
  const clinics = useMyClinics();
  const requests = useMyAppointmentRequests();

  const nextAppointment = upcoming.data?.[0];
  const pendingRequests = requests.data?.filter((r) => r.status === "Pending").length ?? 0;

  const isLoading = upcoming.isLoading || clinics.isLoading || requests.isLoading;
  const isError = upcoming.isError || clinics.isError || requests.isError;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0f172a] dark:text-white">
          Olá{patient?.name ? `, ${patient.name}` : ""}!
        </h1>
        <p className="mt-1 text-sm text-[#64748b] dark:text-slate-400">
          Aqui está o resumo da sua jornada na Cliniq.
        </p>
      </div>

      {isLoading && (
        <p className="py-8 text-center text-sm text-[#64748b] dark:text-slate-400">Carregando...</p>
      )}

      {isError && !isLoading && (
        <ErrorState
          message="Não foi possível carregar seu resumo."
          onRetry={() => {
            void upcoming.refetch();
            void clinics.refetch();
            void requests.refetch();
          }}
        />
      )}

      {!isLoading && !isError && (
        <>
          {/* Próxima consulta em destaque */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#64748b] dark:text-slate-400">
              Próxima consulta
            </h2>
            {nextAppointment ? (
              <AppointmentCard appointment={nextAppointment} />
            ) : (
              <EmptyState
                icon={CalendarClock}
                title="Nenhuma consulta agendada"
                description="Quando você tiver uma consulta marcada, ela aparecerá aqui."
              />
            )}
          </section>

          {/* Indicadores */}
          <section className="grid gap-4 sm:grid-cols-3">
            <MetricCard
              label="Consultas futuras"
              value={upcoming.data?.length ?? 0}
              icon={CalendarCheck}
            />
            <MetricCard
              label="Solicitações pendentes"
              value={pendingRequests}
              icon={ClipboardList}
            />
            <MetricCard
              label="Clínicas vinculadas"
              value={clinics.data?.length ?? 0}
              icon={Building2}
            />
          </section>

          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/paciente/consultas" className="font-medium text-[#0f766e] hover:text-[#14b8a6]">
              Ver todas as consultas →
            </Link>
            <Link href="/paciente/clinicas" className="font-medium text-[#0f766e] hover:text-[#14b8a6]">
              Minhas clínicas →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
