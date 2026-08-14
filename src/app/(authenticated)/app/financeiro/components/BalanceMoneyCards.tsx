"use client";

import { Percent, Scale, TrendingDown, TrendingUp } from "lucide-react";
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
    return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-32" />)}</div>;
  }

  const income = money?.totalIncome ?? 0;
  const outcome = money?.totalOutcome ?? 0;
  const profit = money?.estimatedProfit ?? 0;
  const margin = income > 0 ? (profit / income) * 100 : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Entradas totais" value={formatCurrency(income)} description="Pagamentos e vendas no período." icon={TrendingUp} />
      <MetricCard label="Saídas totais" value={formatCurrency(outcome)} description="Custos de estoque e despesas manuais." icon={TrendingDown} />
      <MetricCard label="Resultado estimado" value={formatCurrency(profit)} description="Entradas menos saídas; não é lucro contábil." icon={Scale} />
      <MetricCard label="Margem estimada" value={`${margin.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`} description="Resultado sobre as entradas." icon={Percent} />
    </div>
  );
}
