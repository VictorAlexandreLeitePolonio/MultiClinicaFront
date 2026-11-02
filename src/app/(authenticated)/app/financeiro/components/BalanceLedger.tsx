"use client";

import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/utils/formatters";
import type { BalanceRecentMovement } from "@/types";

interface BalanceLedgerProps {
  movements: BalanceRecentMovement[];
}

type Filter = "all" | "in" | "out";

const filters: Array<{ key: Filter; label: string }> = [
  { key: "all", label: "Todas" },
  { key: "in", label: "Entradas" },
  { key: "out", label: "Saídas" },
];

const isIncome = (movement: BalanceRecentMovement) => movement.type === "AppointmentPayment";

export function BalanceLedger({ movements }: BalanceLedgerProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const visible = movements.filter((movement) =>
    filter === "all" ? true : filter === "in" ? isIncome(movement) : !isIncome(movement),
  );

  return (
    <section
      aria-labelledby="balance-ledger-title"
      className="min-w-0 rounded-2xl border border-[var(--color-gray-200)] bg-[var(--color-card)] shadow-[var(--shadow-sm)]"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 pb-3">
        <div>
          <h2 id="balance-ledger-title" className="text-lg font-bold text-[var(--color-secondary)]">
            Movimentações
          </h2>
          <p className="text-xs text-[var(--color-gray-600)]">As 10 mais recentes do período</p>
        </div>
        <div role="radiogroup" aria-label="Filtrar movimentações" className="inline-flex gap-1">
          {filters.map((option) => (
            <button
              key={option.key}
              type="button"
              role="radio"
              aria-checked={filter === option.key}
              onClick={() => setFilter(option.key)}
              className={cn(
                "h-7 rounded-lg px-2.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
                filter === option.key
                  ? "bg-[var(--color-primary-muted)] text-[var(--color-primary-dark)] dark:text-[var(--color-primary-light)]"
                  : "text-[var(--color-gray-600)] hover:text-[var(--color-secondary)]",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 border-t border-[var(--color-gray-200)] px-6 py-10 text-center">
          <Receipt size={18} aria-hidden="true" className="text-[var(--color-gray-600)]" />
          <p className="text-sm font-medium text-[var(--color-secondary)]">Nenhuma movimentação aqui</p>
          <p className="max-w-[42ch] text-xs text-[var(--color-gray-600)]">
            Pagamentos recebidos e despesas lançadas no período aparecem neste extrato.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--color-gray-200)] border-t border-[var(--color-gray-200)]">
          {visible.map((movement) => {
            const income = isIncome(movement);
            const Icon = income ? ArrowDownLeft : ArrowUpRight;
            return (
              <li key={`${movement.source}-${movement.id}`} className="flex items-center gap-3 px-5 py-3">
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full",
                    income
                      ? "bg-[var(--color-primary-muted)] text-[var(--color-primary-dark)] dark:text-[var(--color-primary-light)]"
                      : "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
                  )}
                >
                  <Icon size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--color-secondary)]">{movement.description}</p>
                  <p className="text-xs text-[var(--color-gray-600)]">
                    {income ? "Pagamento de consulta" : "Despesa"} <span aria-hidden="true">·</span>{" "}
                    <time dateTime={movement.date.split("T")[0]} className="font-mono">
                      {formatDate(movement.date)}
                    </time>
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 font-mono text-sm font-semibold tabular-nums",
                    income ? "text-[var(--color-primary-dark)] dark:text-[var(--color-primary-light)]" : "text-[var(--color-secondary)]",
                  )}
                >
                  {movement.amount === null ? "—" : `${income ? "+" : "−"} ${formatCurrency(movement.amount)}`}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
