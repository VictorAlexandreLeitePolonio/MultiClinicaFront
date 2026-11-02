"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/utils/apiError";
import type { GetFinancialBalanceParams } from "./services/financial.service";
import { useFinancialBalance } from "./hooks/useFinancialBalance";
import { BalancePeriodFilter, formatPeriod } from "./components/BalancePeriodFilter";
import { BalanceSummary } from "./components/BalanceSummary";
import { BalanceLedger } from "./components/BalanceLedger";
import { BalanceOperations } from "./components/BalanceOperations";
import { ClinicExpensesSection } from "./components/ClinicExpensesSection";

type Tab = "summary" | "expenses";

const tabs: Array<{ key: Tab; label: string }> = [
  { key: "summary", label: "Resumo" },
  { key: "expenses", label: "Despesas" },
];

export default function FinancialBalancePage() {
  const [period, setPeriod] = useState<GetFinancialBalanceParams>({});
  const [tab, setTab] = useState<Tab>("summary");
  const [creating, setCreating] = useState(false);
  const balance = useFinancialBalance(period);
  const data = balance.data;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <PageHeader
        title="Balanço"
        description={data ? formatPeriod(data.period.startDate, data.period.endDate) : "Entradas, saídas e resultado da clínica."}
        actions={
          <Button
            fullWidth={false}
            onClick={() => {
              setTab("expenses");
              setCreating(true);
            }}
          >
            <Plus size={16} aria-hidden="true" />
            Nova despesa
          </Button>
        }
      />

      <div className="flex flex-col-reverse gap-3 border-b border-[var(--color-gray-200)] sm:flex-row sm:items-end sm:justify-between">
        <div role="tablist" aria-label="Seções do balanço" className="flex gap-1">
          {tabs.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              id={`balance-tab-${item.key}`}
              aria-selected={tab === item.key}
              aria-controls={`balance-panel-${item.key}`}
              data-tutorial={item.key === "expenses" ? "financial-expenses" : undefined}
              onClick={() => setTab(item.key)}
              className={cn(
                "-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
                tab === item.key
                  ? "border-[var(--color-primary-dark)] text-[var(--color-primary-dark)] dark:border-[var(--color-primary-light)] dark:text-[var(--color-primary-light)]"
                  : "border-transparent text-[var(--color-gray-600)] hover:text-[var(--color-secondary)]",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div data-tutorial="financial-period" className="pb-2">
          <BalancePeriodFilter onApply={setPeriod} />
        </div>
      </div>

      {/* Troca de aba: só opacidade, 150 ms (sistema). */}
      <motion.div
        key={tab}
        role="tabpanel"
        id={`balance-panel-${tab}`}
        aria-labelledby={`balance-tab-${tab}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="flex flex-col gap-6"
      >
        {tab === "summary" ? (
          balance.isError ? (
            <ErrorState
              message={getApiErrorMessage(balance.error, "Erro ao carregar o balanço.")}
              onRetry={() => void balance.refetch()}
            />
          ) : (
            <>
              <div data-tutorial="financial-money">
                <BalanceSummary money={data?.money ?? null} loading={balance.isLoading} />
              </div>
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
                <div data-tutorial="financial-movements" className="min-w-0">
                  {data ? <BalanceLedger movements={data.recentMovements ?? []} /> : <Skeleton className="h-96 rounded-2xl" />}
                </div>
                <div data-tutorial="financial-operational">
                  {data ? (
                    <BalanceOperations
                      money={data.money}
                      appointments={data.appointments}
                      patients={data.patients}
                      evolutions={data.evolutions}
                    />
                  ) : (
                    <Skeleton className="h-80 rounded-2xl" />
                  )}
                </div>
              </div>
            </>
          )
        ) : (
          <ClinicExpensesSection period={period} creating={creating} onCreatingChange={setCreating} />
        )}
      </motion.div>
    </div>
  );
}
