"use client";

import { motion } from "motion/react";
import { Calendar, ClipboardList, BarChart2, ArrowRight } from "lucide-react";
import { staggerContainer } from "@/lib/motion";
import { GreetingBanner } from "./components/GreetingBanner";
import { AppointmentCard } from "./components/AppointmentCard";
import { AppointmentSkeleton } from "./components/AppointmentSkeleton";
import { SystemInfoCard } from "./components/SystemInfoCard";
import { LottieCard } from "./components/LottieCard";
import { useTodayAppointments } from "./hooks/useTodayAppointments";
import { useMonthlyBalance } from "../financeiro/hooks/balance";
import { useAuth } from "@/contexts/AuthContext";
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
    <div className="p-8 flex flex-col gap-6 max-w-6xl mx-auto">
      <GreetingBanner totalAppointments={total} />
      {/* Card de balanço financeiro - apenas para Admin */}
      {user?.role === "Admin" && (
        <div className="mt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-sm bg-[#1a4a3a] border-2 border-[#143d2f] flex items-center justify-center">
              <BarChart2 size={16} className="text-white" />
            </div>
            <h2
              className="text-lg font-bold text-[#1a2a4a]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Resumo Financeiro
            </h2>
          </div>

          <div className="bg-white rounded-sm border-2 border-[#e2ebe6] p-6 shadow-[2px_2px_0_0_#e2ebe6]">
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-lg font-bold text-[#1a2a4a] capitalize"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Balanço de {currentMonthLabel}
              </h3>
              <Link
                href="/financeiro"
                className="flex items-center gap-1 text-sm text-[#1a4a3a] hover:text-[#143d2f] font-semibold transition-colors"
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
                <div className="bg-green-50 border-2 border-green-100 rounded-sm p-4">
                  <p
                    className="text-sm text-green-700 mb-1"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    Entradas
                  </p>
                  <p
                    className="text-xl font-bold text-green-600"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {formatCurrency(balance.totalIncome)}
                  </p>
                </div>
                <div className="bg-red-50 border-2 border-red-100 rounded-sm p-4">
                  <p
                    className="text-sm text-red-700 mb-1"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    Saídas
                  </p>
                  <p
                    className="text-xl font-bold text-red-600"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {formatCurrency(balance.totalExpenses)}
                  </p>
                </div>
                <div
                  className={`border-2 rounded-sm p-4 ${
                    balance.netBalance >= 0
                      ? "bg-blue-50 border-blue-100"
                      : "bg-red-50 border-red-100"
                  }`}
                >
                  <p
                    className={`text-sm mb-1 ${
                      balance.netBalance >= 0 ? "text-blue-700" : "text-red-700"
                    }`}
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    Saldo
                  </p>
                  <p
                    className={`text-xl font-bold ${
                      balance.netBalance >= 0 ? "text-blue-600" : "text-red-600"
                    }`}
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {formatCurrency(balance.netBalance)}
                  </p>
                </div>
              </div>
            ) : (
              <p
                className="text-[#4a6354] text-center py-4"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Nenhum dado financeiro disponível para este mês.
              </p>
            )}
          </div>
        </div>
      )}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-sm bg-[#1a4a3a] border-2 border-[#143d2f] flex items-center justify-center">
            <ClipboardList size={16} className="text-white" />
          </div>
          <h2
            className="text-lg font-bold text-[#1a2a4a]"
            style={{ fontFamily: "var(--font-serif)" }}
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
          <div className="bg-red-50 border-2 border-red-200 rounded-sm p-4 text-red-700">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && data.length === 0 && (
          <div className="text-center py-12 bg-[#f8faf9] border-2 border-dashed border-[#e2ebe6] rounded-sm">
            <Calendar size={32} className="mx-auto mb-3 text-[#1a4a3a]/40" />
            <p
              className="text-sm text-[#4a6354]"
              style={{ fontFamily: "var(--font-serif)" }}
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

      {/* Cards informativos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <SystemInfoCard />
        <LottieCard />
      </div>
    </div>
  );
}
