"use client";

import { motion } from "motion/react";
import { Calendar, ClipboardList, CreditCard, FileText, Users } from "lucide-react";
import { staggerContainer } from "@/lib/motion";
import { GreetingBanner } from "./components/GreetingBanner";
import { AppointmentCard } from "./components/AppointmentCard";
import { AppointmentSkeleton } from "./components/AppointmentSkeleton";
import { ClinicDashboardActions } from "./components/ClinicDashboardActions";
import { EvolutionSummaryCard } from "./components/EvolutionSummaryCard";
import { useTodayAppointments } from "./hooks/useTodayAppointments";
import { useAuth } from "@/contexts/AuthContext";
import { MetricCard } from "@/components/ui/MetricCard";

export default function BemVindoPage() {
  const { user } = useAuth();
  const { data, total, loading, error } = useTodayAppointments();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-8">
      <GreetingBanner totalAppointments={total} />

      {user?.role && user.role !== "SuperAdmin" && (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricCard
            label="Agendamentos hoje"
            value={total}
            description="Total carregado para a agenda do dia."
            icon={Calendar}
          />
          <MetricCard
            label="Prioridade"
            value={
              user.role === "Administrador"
                ? "Gestão"
                : user.role === "Profissional"
                  ? "Atendimento"
                  : "Recepção"
            }
            description="Dashboard ajustado ao perfil logado."
            icon={user.role === "Recepcao" ? CreditCard : user.role === "Profissional" ? FileText : Users}
          />
          <MetricCard
            label="Clínica"
            value={user.clinicName ?? "Operação"}
            description="Contexto operacional da sessão atual."
            icon={ClipboardList}
          />
        </section>
      )}

      {user?.role && <ClinicDashboardActions role={user.role} />}

      {user?.role && user.role !== "SuperAdmin" && <EvolutionSummaryCard />}

      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ecfdf5] text-[#0f766e] ring-1 ring-[#a7f3d0]">
            <ClipboardList size={16} />
          </div>
          <h2
            className="text-lg font-bold text-[#0f172a] dark:text-white"
          >
            Agendamentos de hoje
          </h2>
        </div>

        {/* Skeleton loading */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <AppointmentSkeleton key={i} />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && data.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#a7f3d0] bg-white/80 py-12 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
            <Calendar size={32} className="mx-auto mb-3 text-[#14b8a6]/70" />
            <p
              className="text-sm text-[#64748b] dark:text-slate-300"
            >
              Nenhum agendamento para hoje.
            </p>
          </div>
        )}

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-3"
        >
          {!loading &&
            data.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
        </motion.div>
      </div>

    </div>
  );
}
