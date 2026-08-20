"use client";

import { useState } from "react";
import { CalendarClock, History } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { AppointmentCard } from "../components/AppointmentCard";
import { useHistoryAppointments, useUpcomingAppointments } from "../hooks/usePatientPortal";
import { PatientAppointment } from "@/types";

type Tab = "upcoming" | "history";

const TABS: { key: Tab; label: string }[] = [
  { key: "upcoming", label: "Próximas" },
  { key: "history", label: "Histórico" },
];

export default function PatientAppointmentsPage() {
  const [tab, setTab] = useState<Tab>("upcoming");
  const upcoming = useUpcomingAppointments();
  const history = useHistoryAppointments();

  const active = tab === "upcoming" ? upcoming : history;
  const appointments: PatientAppointment[] = active.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0f172a] dark:text-white">Minhas consultas</h1>

      <div className="flex gap-1 border-b border-[#d7f3ea] dark:border-slate-800">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === key
                ? "border-[#14b8a6] text-[#0f766e] dark:text-[#67e8f9]"
                : "border-transparent text-[#64748b] hover:text-[#0f172a] dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {active.isLoading && (
        <p className="py-8 text-center text-sm text-[#64748b] dark:text-slate-400">Carregando...</p>
      )}

      {active.isError && !active.isLoading && (
        <ErrorState message="Não foi possível carregar suas consultas." onRetry={() => void active.refetch()} />
      )}

      {!active.isLoading && !active.isError && appointments.length === 0 && (
        <EmptyState
          icon={tab === "upcoming" ? CalendarClock : History}
          title={tab === "upcoming" ? "Nenhuma consulta futura" : "Nenhuma consulta anterior"}
          description={
            tab === "upcoming"
              ? "Você não tem consultas agendadas no momento."
              : "Seu histórico de consultas aparecerá aqui."
          }
        />
      )}

      {!active.isLoading && !active.isError && appointments.length > 0 && (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <AppointmentCard key={appointment.appointmentId} appointment={appointment} />
          ))}
        </div>
      )}
    </div>
  );
}
