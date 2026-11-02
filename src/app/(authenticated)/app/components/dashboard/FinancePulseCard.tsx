"use client";

import Link from "next/link";
import { ArrowRight, CircleDollarSign, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { useFinancialBalance } from "../../financeiro/hooks/useFinancialBalance";
import { toPercent } from "./dashboardData";

export function FinancePulseCard() {
  const { data, isLoading, isError, refetch } = useFinancialBalance({});

  return (
    <section
      aria-labelledby="finance-pulse-title"
      className="min-w-0 rounded-2xl border border-[var(--color-gray-200)] bg-[var(--color-card)] p-5 shadow-[var(--shadow-sm)] sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-muted)] text-[var(--color-primary-dark)]">
            <CircleDollarSign size={17} aria-hidden="true" />
          </span>
          <div>
            <h2
              id="finance-pulse-title"
              className="text-lg font-bold tracking-tight text-[var(--color-secondary)]"
            >
              Caixa em movimento
            </h2>
            <p className="mt-0.5 text-sm text-[var(--color-gray-600)]">
              {data
                ? `${formatDate(data.period.startDate)} – ${formatDate(data.period.endDate)}`
                : "Entradas, saídas e resultado do período."}
            </p>
          </div>
        </div>

        <Link
          href="/app/financeiro"
          className="inline-flex items-center gap-1.5 rounded-lg px-1 py-1 text-sm font-semibold text-[var(--color-primary-dark)] transition-colors hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        >
          Ver balanço
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-6 space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : isError || !data ? (
        <div className="mt-6 flex flex-col items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          <p>Não foi possível carregar o resumo financeiro.</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
          >
            <RefreshCw size={13} aria-hidden="true" />
            Tentar novamente
          </button>
        </div>
      ) : data.money.totalIncome === 0 && data.money.totalOutcome === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-[var(--color-gray-200)] px-5 py-8 text-center text-sm text-[var(--color-gray-600)]">
          Sem movimentação financeira neste período.
        </p>
      ) : (
        <div className="mt-6">
          <MoneyFlow
            income={data.money.totalIncome}
            outcome={data.money.totalOutcome}
            profit={data.money.estimatedProfit}
          />

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[var(--color-primary-light)] bg-[var(--color-primary-muted)] px-2.5 py-1 font-mono text-[10px] font-semibold text-[var(--color-primary-dark)]">
              margem {data.money.totalIncome > 0 ? `${Math.round((data.money.estimatedProfit / data.money.totalIncome) * 100)}%` : "—"}
            </span>
            <span className="font-mono text-[10px] text-[var(--color-gray-600)]">
              {data.money.paidAppointmentCount} consultas pagas
            </span>
          </div>

          <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-[var(--color-gray-200)] pt-4">
            <div>
              <dt className="text-xs font-medium text-[var(--color-gray-600)]">
                Novos pacientes
              </dt>
              <dd className="mt-1 font-mono text-lg font-semibold text-[var(--color-secondary)]">
                {data.patients.newInPeriod}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-[var(--color-gray-600)]">
                Consultas
              </dt>
              <dd className="mt-1 font-mono text-lg font-semibold text-[var(--color-secondary)]">
                {data.appointments.completed}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-[var(--color-gray-600)]">
                Evoluções
              </dt>
              <dd className="mt-1 font-mono text-lg font-semibold text-[var(--color-secondary)]">
                {data.evolutions.evolutionsInPeriod}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </section>
  );
}

function MoneyFlow({
  income,
  outcome,
  profit,
}: {
  income: number;
  outcome: number;
  profit: number;
}) {
  const max = Math.max(income, outcome, Math.abs(profit), 1);
  const rows = [
    {
      label: "Entradas",
      value: income,
      color: "var(--color-primary-dark)",
      width: toPercent((income / max) * 100),
    },
    {
      label: "Saídas",
      value: outcome,
      color: "oklch(0.61 0.2 25)",
      width: toPercent((outcome / max) * 100),
    },
    {
      label: "Resultado",
      value: profit,
      color: profit >= 0 ? "var(--color-primary-dark)" : "oklch(0.61 0.2 25)",
      width: toPercent((Math.abs(profit) / max) * 100),
    },
  ];

  return (
    <div className="space-y-3.5">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-medium text-[var(--color-secondary)]">{row.label}</span>
            <span className="font-mono text-xs font-semibold text-[var(--color-secondary)]">
              {formatCurrency(row.value)}
            </span>
          </div>
          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-[var(--color-gray-100)]">
            <div
              className="dashboard-fill h-full rounded-full"
              style={{ width: `${row.width}%`, backgroundColor: row.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
