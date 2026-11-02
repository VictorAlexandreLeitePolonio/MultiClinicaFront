"use client";

import NumberFlow from "@number-flow/react";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import type { BalanceMoneySummary } from "@/types";

interface BalanceSummaryProps {
  money: BalanceMoneySummary | null;
  loading?: boolean;
}

const currency = { style: "currency", currency: "BRL" } as const;

/** Quanto das entradas as saídas consomem; null sem entradas (não há base para a conta). */
export function outcomeShare(money: Pick<BalanceMoneySummary, "totalIncome" | "totalOutcome">): number | null {
  if (money.totalIncome <= 0) return null;
  return money.totalOutcome / money.totalIncome;
}

function Cell({ label, hint, children, first = false }: { label: string; hint: string; children: React.ReactNode; first?: boolean }) {
  return (
    <div className={cn("min-w-0 px-5 py-4", !first && "border-t border-[var(--color-gray-200)] sm:border-t-0 sm:border-l")}>
      <dt className="text-sm text-[var(--color-gray-600)]">{label}</dt>
      <dd className="mt-1 truncate font-mono text-2xl font-semibold tracking-[-0.03em] text-[var(--color-secondary)] tabular-nums">
        {children}
      </dd>
      <p className="mt-0.5 truncate text-xs text-[var(--color-gray-600)]">{hint}</p>
    </div>
  );
}

export function BalanceSummary({ money, loading = false }: BalanceSummaryProps) {
  if (loading || !money) {
    return <Skeleton className="h-[188px] rounded-2xl" />;
  }

  const share = outcomeShare(money);
  const margin = share === null ? null : 1 - share;
  const negative = money.estimatedProfit < 0;
  const fill = Math.min(1, share ?? 0);

  return (
    <section
      aria-label="Resumo do período"
      className="overflow-hidden rounded-2xl border border-[var(--color-gray-200)] bg-[var(--color-card)] shadow-[var(--shadow-sm)]"
    >
      <dl className="grid sm:grid-cols-2 lg:grid-cols-4">
        <Cell first label="Entradas" hint={`${money.paidAppointmentCount} pagamento(s) recebido(s)`}>
          <NumberFlow value={money.totalIncome} locales="pt-BR" format={currency} />
        </Cell>
        <Cell label="Saídas" hint={`${money.manualExpenseCount} despesa(s) lançada(s)`}>
          <NumberFlow value={money.totalOutcome} locales="pt-BR" format={currency} />
        </Cell>
        <Cell label="Resultado" hint="Entradas menos saídas">
          <span className={negative ? "text-red-600 dark:text-red-400" : "text-[var(--color-primary-dark)] dark:text-[var(--color-primary-light)]"}>
            <NumberFlow value={money.estimatedProfit} locales="pt-BR" format={{ ...currency, signDisplay: "exceptZero" }} />
          </span>
        </Cell>
        <Cell label="Margem" hint="Resultado sobre as entradas">
          {margin === null ? (
            "—"
          ) : (
            <NumberFlow value={margin} locales="pt-BR" format={{ style: "percent", maximumFractionDigits: 1, signDisplay: "negative" }} />
          )}
        </Cell>
      </dl>

      <div className="border-t border-[var(--color-gray-200)] px-5 py-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
          <span className="text-[var(--color-secondary)]">
            {share === null ? (
              "Sem entradas no período"
            ) : (
              <>
                As saídas consomem{" "}
                <strong className={cn("font-mono font-semibold tabular-nums", share > 1 && "text-red-600 dark:text-red-400")}>
                  {Math.round(share * 100)}%
                </strong>{" "}
                das entradas
              </>
            )}
          </span>
          {share !== null && share > 1 && (
            <span className="text-xs text-red-600 dark:text-red-400">Período no prejuízo</span>
          )}
        </div>
        {/* Trilho = entradas; preenchimento = saídas. scaleX anima a troca de período sem layout. */}
        <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-[var(--color-primary-muted)]" aria-hidden="true">
          <div
            className={cn(
              "h-full origin-left rounded-full transition-transform duration-[240ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
              share !== null && share > 1 ? "bg-red-500" : "bg-[var(--color-primary-dark)]",
            )}
            style={{ transform: `scaleX(${fill})` }}
          />
        </div>
      </div>
    </section>
  );
}
