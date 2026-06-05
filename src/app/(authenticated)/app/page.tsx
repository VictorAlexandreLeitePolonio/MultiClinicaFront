"use client";

import { motion } from "motion/react";
import { ArrowRight, BarChart2, Calendar, ClipboardList, CreditCard, FileText, Users } from "lucide-react";
import { staggerContainer } from "@/lib/motion";
import { GreetingBanner } from "./components/GreetingBanner";
import { AppointmentCard } from "./components/AppointmentCard";
import { AppointmentSkeleton } from "./components/AppointmentSkeleton";
import { ClinicDashboardActions } from "./components/ClinicDashboardActions";
import { useTodayAppointments } from "./hooks/useTodayAppointments";
import { useMonthlyBalance } from "./financeiro/hooks/balance";
import { useAuth } from "@/contexts/AuthContext";
import { MetricCard } from "@/components/ui/MetricCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/utils/formatters";
import Link from "next/link";

export default function BemVindoPage() {
  const { user } = useAuth();
  const { data, total, loading, error } = useTodayAppointments();

  // Mês atual calculado automaticamente
  const currentMonth = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  })();

  const { data: balance, loading: balanceLoading } =
    useMonthlyBalance(currentMonth);

  // Formatar o mês por extenso para o título
  const currentMonthLabel = (() => {
    const now = new Date();
    return now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  })();

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

      {/* Card de balanço financeiro - apenas para Administrador */}
      {user?.role === "Administrador" && (
        <section className="mt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ecfdf5] text-[#0f766e] ring-1 ring-[#a7f3d0]">
              <BarChart2 size={16} />
            </div>
            <h2
              className="text-lg font-bold text-[#0f172a] dark:text-white"
            >
              Resumo Financeiro
            </h2>
          </div>

          <div className="rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.42)] dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-lg font-bold capitalize text-[#0f172a] dark:text-white"
              >
                Balanço de {currentMonthLabel}
              </h3>
              <Link
                href="/app/financeiro"
                className="flex items-center gap-1 text-sm font-semibold text-[#0f766e] transition-colors hover:text-[#14b8a6] dark:text-[#67e8f9]"
              >
                Ver detalhes
                <ArrowRight size={16} />
              </Link>
            </div>

            {balanceLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : balance ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <p
                    className="mb-1 text-sm font-medium text-emerald-700"
                  >
                    Entradas
                  </p>
                  <p
                    className="text-xl font-bold text-emerald-600"
                  >
                    {formatCurrency(balance.totalIncome)}
                  </p>
                </div>
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                  <p
                    className="mb-1 text-sm font-medium text-red-700"
                  >
                    Saídas
                  </p>
                  <p
                    className="text-xl font-bold text-red-600"
                  >
                    {formatCurrency(balance.totalExpenses)}
                  </p>
                </div>
                <div
                  className={`rounded-2xl border p-4 ${
                    balance.netBalance >= 0
                      ? "border-cyan-100 bg-cyan-50"
                      : "border-red-100 bg-red-50"
                  }`}
                >
                  <p
                    className={`mb-1 text-sm font-medium ${
                      balance.netBalance >= 0 ? "text-cyan-700" : "text-red-700"
                    }`}
                  >
                    Saldo
                  </p>
                  <p
                    className={`text-xl font-bold ${
                      balance.netBalance >= 0 ? "text-cyan-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(balance.netBalance)}
                  </p>
                </div>
              </div>
            ) : (
              <p
                className="py-4 text-center text-[#64748b] dark:text-slate-300"
              >
                Nenhum dado financeiro disponível para este mês.
              </p>
            )}
          </div>
        </section>
      )}
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
