"use client";

import { Scale, TrendingDown, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/utils/formatters";
import type { BalanceMoneySummary } from "@/types";

interface BalanceMoneyCardsProps {
  money: BalanceMoneySummary | null;
  loading?: boolean;
}

export function BalanceMoneyCards({ money, loading = false }: BalanceMoneyCardsProps) {
  if (loading) {
    return <div className="grid gap-4 md:grid-cols-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-32" />)}</div>;
  }

  const income = money?.totalIncome ?? 0;
  const outcome = money?.totalOutcome ?? 0;
  const profit = money?.estimatedProfit ?? 0;
  const costs = [
    ["Compras", money?.productPurchaseCost ?? 0],
    ["Saídas", money?.productOutputCost ?? 0],
    ["Perdas", money?.productLossCost ?? 0],
    ["Uso interno", money?.productInternalUseCost ?? 0],
    ["Despesas manuais", money?.manualExpenseCost ?? 0],
  ] as const;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Entradas totais" value={formatCurrency(income)} description="Pagamentos e vendas no período." icon={TrendingUp} />
        <MetricCard label="Saídas totais" value={formatCurrency(outcome)} description="Custos de estoque e despesas manuais." icon={TrendingDown} />
        <MetricCard label="Resultado estimado" value={formatCurrency(profit)} description="Entradas menos saídas; não é lucro contábil." icon={Scale} />
      </div>
      <div className="grid gap-3 rounded-2xl border border-[#d7f3ea] bg-white p-4 sm:grid-cols-2 lg:grid-cols-5 dark:border-slate-800 dark:bg-slate-900">
        {costs.map(([label, value]) => <div key={label}><p className="text-xs text-[#64748b] dark:text-slate-400">{label}</p><p className="mt-1 font-semibold text-[#0f172a] dark:text-white">{formatCurrency(value)}</p></div>)}
      </div>
    </div>
  );
}
