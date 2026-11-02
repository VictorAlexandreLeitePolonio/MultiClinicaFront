"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTodayAppointments } from "./hooks/useTodayAppointments";
import { EvolutionSummaryCard } from "./components/EvolutionSummaryCard";
import { PlanUsageCard } from "./components/PlanUsageCard";
import { DashboardCommandBar } from "./components/dashboard/DashboardCommandBar";
import { FinancePulseCard } from "./components/dashboard/FinancePulseCard";
import { TodayAgenda } from "./components/dashboard/TodayAgenda";

export default function BemVindoPage() {
  const { user, tenant } = useAuth();
  const { data, total, loading, error, refetch } = useTodayAppointments();

  if (!user?.role) return null;

  const isClinical = user.role === "Administrador" || user.role === "Profissional";
  const isAdmin = user.role === "Administrador";

  return (
    <div className="mx-auto flex max-w-[1500px] flex-col gap-5 p-6 lg:p-8">
      <DashboardCommandBar
        name={user.name}
        clinicName={tenant?.displayName ?? user.clinicName}
        role={user.role}
        appointments={data}
        total={total}
        loading={loading}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-5">
          <TodayAgenda
            appointments={data}
            loading={loading}
            error={error}
            onRetry={() => void refetch()}
          />
          {isAdmin && <FinancePulseCard />}
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          {isClinical && <EvolutionSummaryCard />}
          {user.role !== "SuperAdmin" && <PlanUsageCard />}
        </div>
      </div>
    </div>
  );
}
