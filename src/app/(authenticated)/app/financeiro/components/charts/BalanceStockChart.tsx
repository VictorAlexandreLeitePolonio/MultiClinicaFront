"use client";

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BalanceStockSummary } from "@/types";
import { ChartTooltip, EmptyChart, useChartColors } from "./chartKit";

interface Props {
  stock: BalanceStockSummary;
}

export function BalanceStockChart({ stock }: Props) {
  const { colors } = useChartColors();
  const data = [
    { name: "Entradas", value: stock.stockEntriesInPeriod },
    { name: "Saídas", value: stock.stockOutputsInPeriod },
    { name: "Vendas", value: stock.productSalesInPeriod },
    { name: "Compras", value: stock.productPurchasesInPeriod },
    { name: "Perdas", value: stock.productLossesInPeriod },
    { name: "Uso interno", value: stock.productInternalUseInPeriod },
  ]
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) return <EmptyChart message="Sem movimentações de estoque no período." />;

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, data.length * 62)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 48, left: 8, bottom: 4 }} barCategoryGap="28%">
        <CartesianGrid horizontal={false} stroke={colors.grid} strokeDasharray="3 3" />
        <XAxis type="number" tick={{ fontSize: 12, fill: colors.axis }} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fill: colors.axis }} axisLine={false} tickLine={false} width={96} />
        <Tooltip cursor={{ fill: colors.grid, opacity: 0.35 }} content={({ active, payload }) => <ChartTooltip active={active} payload={(payload as never[])?.map((p: { value?: number }) => ({ name: "Movimentações", value: p.value, color: colors.teal }))} formatter={(v) => `${v}`} />} />
        <Bar dataKey="value" fill={colors.teal} radius={[0, 4, 4, 0]} barSize={34} isAnimationActive={false}>
          <LabelList dataKey="value" position="right" style={{ fontSize: 12, fontWeight: 600, fill: colors.axis }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
