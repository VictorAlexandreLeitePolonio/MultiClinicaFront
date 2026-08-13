"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { getApiErrorMessage } from "@/utils/apiError";
import type { GetFinancialBalanceParams } from "./services/financial.service";
import { useFinancialBalance } from "./hooks/useFinancialBalance";
import { BalanceMoneyCards } from "./components/BalanceMoneyCards";
import { BalanceOperationalCards } from "./components/BalanceOperationalCards";
import { BalancePeriodFilter } from "./components/BalancePeriodFilter";
import { BalanceRecentMovementsTable } from "./components/BalanceRecentMovementsTable";
import { BalanceStockSection } from "./components/BalanceStockSection";
import { ClinicExpensesSection } from "./components/ClinicExpensesSection";

export default function FinancialBalancePage() {
  const [period, setPeriod] = useState<GetFinancialBalanceParams>({});
  const balance = useFinancialBalance(period);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-8">
      <PageHeader
        title="Balanço"
        actions={<BalancePeriodFilter onApply={setPeriod} />}
      />

      {balance.isError ? (
        <ErrorState
          message={getApiErrorMessage(balance.error, "Erro ao carregar o balanço.")}
          onRetry={() => void balance.refetch()}
        />
      ) : balance.isLoading ? (
        <>
          <BalanceMoneyCards money={null} loading />
          <BalanceOperationalCards money={null} appointments={null} patients={null} stock={null} evolutions={null} />
          <BalanceStockSection stock={null} loading />
        </>
      ) : !balance.data ? (
        <EmptyState title="Nenhum dado disponível" description="Não há dados de balanço para o período selecionado." />
      ) : (
        <>
          <p className="text-sm text-[#64748b] dark:text-slate-300">
            Período: {balance.data.period.startDate} a {balance.data.period.endDate}
          </p>
          <BalanceMoneyCards money={balance.data.money} />
          <BalanceOperationalCards
            money={balance.data.money}
            appointments={balance.data.appointments}
            patients={balance.data.patients}
            stock={balance.data.stock}
            evolutions={balance.data.evolutions}
          />
          <BalanceStockSection stock={balance.data.stock} />
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Últimas movimentações</h2>
            <BalanceRecentMovementsTable movements={balance.data.recentMovements ?? []} />
          </section>
        </>
      )}
      <ClinicExpensesSection period={period} />
    </div>
  );
}
