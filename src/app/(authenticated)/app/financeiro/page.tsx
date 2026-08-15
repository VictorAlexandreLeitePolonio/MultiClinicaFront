"use client";

import { useState } from "react";
import { CalendarRange } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatDate } from "@/utils/formatters";
import type { GetFinancialBalanceParams } from "./services/financial.service";
import { useFinancialBalance } from "./hooks/useFinancialBalance";
import { BalanceMoneyCards } from "./components/BalanceMoneyCards";
import { BalanceOperationalCards } from "./components/BalanceOperationalCards";
import { BalancePeriodFilter } from "./components/BalancePeriodFilter";
import { BalanceRecentMovementsTable } from "./components/BalanceRecentMovementsTable";
import { LowStockProductsTable } from "./components/LowStockProductsTable";
import { ClinicExpensesSection } from "./components/ClinicExpensesSection";
import { ChartCard } from "./components/charts/chartKit";
import { BalanceWaterfallChart } from "./components/charts/BalanceWaterfallChart";
import { BalanceAppointmentsDonut } from "./components/charts/BalanceAppointmentsDonut";
import { BalanceStockChart } from "./components/charts/BalanceStockChart";

export default function FinancialBalancePage() {
  const [period, setPeriod] = useState<GetFinancialBalanceParams>({});
  const balance = useFinancialBalance(period);
  const data = balance.data;

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-6 p-8">
      <PageHeader
        title="Balanço"
        actions={
          data ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d7f3ea] bg-[#f8fffc] px-3.5 py-1.5 text-xs font-semibold text-[#0f766e] dark:border-slate-700 dark:bg-slate-900 dark:text-[#67e8f9]">
              <CalendarRange size={14} />
              {formatDate(data.period.startDate)} – {formatDate(data.period.endDate)}
            </span>
          ) : undefined
        }
      />

      <div data-tutorial="financial-period">
        <BalancePeriodFilter onApply={setPeriod} />
      </div>

      {balance.isError ? (
        <ErrorState message={getApiErrorMessage(balance.error, "Erro ao carregar o balanço.")} onRetry={() => void balance.refetch()} />
      ) : balance.isLoading ? (
        <>
          <BalanceMoneyCards money={null} loading />
          <Skeleton className="h-[440px]" />
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </>
      ) : !data ? (
        <EmptyState title="Nenhum dado disponível" description="Não há dados de balanço para o período selecionado." />
      ) : (
        <>
          <div data-tutorial="financial-money">
            <BalanceMoneyCards money={data.money} />
          </div>

          <div data-tutorial="financial-result">
            <ChartCard title="Como o resultado se formou" subtitle="Das entradas, subtraindo cada custo, até o resultado do período.">
              <BalanceWaterfallChart money={data.money} />
            </ChartCard>
          </div>

          <div data-tutorial="financial-charts" className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Consultas por status" subtitle="Distribuição das consultas no período.">
              <BalanceAppointmentsDonut appointments={data.appointments} />
            </ChartCard>
            <ChartCard title="Movimentações de estoque" subtitle="Quantidade por tipo de movimentação.">
              <BalanceStockChart stock={data.stock} />
            </ChartCard>
          </div>

          <div data-tutorial="financial-operational">
            <BalanceOperationalCards
              money={data.money}
              appointments={data.appointments}
              patients={data.patients}
              stock={data.stock}
              evolutions={data.evolutions}
            />
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-2">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Produtos abaixo do mínimo</h2>
              <LowStockProductsTable products={data.stock.lowStockProducts ?? []} />
            </section>
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Últimas movimentações</h2>
              <BalanceRecentMovementsTable movements={data.recentMovements ?? []} />
            </section>
          </div>
        </>
      )}

      <div data-tutorial="financial-expenses">
        <ClinicExpensesSection period={period} />
      </div>
    </div>
  );
}
