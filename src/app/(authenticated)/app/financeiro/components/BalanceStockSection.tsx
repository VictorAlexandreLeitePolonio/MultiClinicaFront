"use client";

import { Package } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { Skeleton } from "@/components/ui/Skeleton";
import type { BalanceStockSummary } from "@/types";
import { LowStockProductsTable } from "./LowStockProductsTable";

interface BalanceStockSectionProps {
  stock: BalanceStockSummary | null;
  loading?: boolean;
}

export function BalanceStockSection({ stock, loading = false }: BalanceStockSectionProps) {
  if (loading) {
    return <Skeleton className="h-64" />;
  }

  const products = stock?.lowStockProducts ?? [];
  const values = [
    ["Produtos", stock?.totalProducts ?? 0],
    ["Entradas", stock?.stockEntriesInPeriod ?? 0],
    ["Saídas", stock?.stockOutputsInPeriod ?? 0],
    ["Compras", stock?.productPurchasesInPeriod ?? 0],
  ] as const;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Package size={18} className="text-[#0f766e]" />
        <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Resumo de estoque</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {values.map(([label, value]) => <MetricCard key={label} label={label} value={value} />)}
      </div>
      <div className="space-y-3">
        <h3 className="text-base font-bold text-[#0f172a] dark:text-white">Produtos abaixo do mínimo</h3>
        <LowStockProductsTable products={products} />
      </div>
    </section>
  );
}
