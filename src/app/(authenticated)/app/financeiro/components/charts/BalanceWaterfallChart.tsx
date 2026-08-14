"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/utils/formatters";
import type { BalanceMoneySummary } from "@/types";
import { ChartTooltip, EmptyChart, useChartColors } from "./chartKit";

function formatCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1000) return `R$ ${(value / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`;
  return `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
}

interface Props {
  money: BalanceMoneySummary;
}

type Kind = "income" | "cost" | "result";
interface Step {
  name: string;
  base: number;
  value: number;
  amount: number;
  kind: Kind;
}

export function BalanceWaterfallChart({ money }: Props) {
  const { colors } = useChartColors();
  const income = money.totalIncome;

  const costs: Array<[string, number]> = [
    ["Compras", money.productPurchaseCost],
    ["Saídas", money.productOutputCost],
    ["Perdas", money.productLossCost],
    ["Uso interno", money.productInternalUseCost],
    ["Despesas", money.manualExpenseCost],
  ];

  const steps: Step[] = [{ name: "Entradas", base: 0, value: income, amount: income, kind: "income" }];
  let running = income;
  for (const [name, cost] of costs) {
    if (cost <= 0) continue;
    running -= cost;
    steps.push({ name, base: running, value: cost, amount: -cost, kind: "cost" });
  }
  const profit = money.estimatedProfit;
  steps.push({ name: "Resultado", base: 0, value: profit, amount: profit, kind: "result" });

  if (income <= 0 && steps.length <= 2) {
    return <EmptyChart message="Sem movimentação financeira no período." />;
  }

  const fillFor = (kind: Kind) => (kind === "income" ? colors.income : kind === "cost" ? colors.cost : colors.result);

  return (
    <ResponsiveContainer width="100%" height={440}>
      <BarChart data={steps} margin={{ top: 28, right: 16, left: 16, bottom: 4 }} barCategoryGap="22%">
        <XAxis dataKey="name" tick={{ fontSize: 13, fill: colors.axis }} axisLine={{ stroke: colors.grid }} tickLine={false} interval={0} />
        <YAxis tick={{ fontSize: 12, fill: colors.axis }} axisLine={false} tickLine={false} width={78} tickFormatter={(v) => formatCompact(Number(v))} />
        <Tooltip
          cursor={{ fill: colors.grid, opacity: 0.35 }}
          content={({ active, payload }) => {
            const step = payload?.[0]?.payload as Step | undefined;
            if (!active || !step) return null;
            return (
              <ChartTooltip
                active
                label={step.name}
                payload={[{ name: step.kind === "income" ? "Entrou" : step.kind === "cost" ? "Saiu" : "Resultado", value: Math.abs(step.amount), color: fillFor(step.kind) }]}
                formatter={formatCurrency}
              />
            );
          }}
        />
        <Bar dataKey="base" stackId="w" fill="transparent" isAnimationActive={false} />
        <Bar dataKey="value" stackId="w" radius={[4, 4, 0, 0]} isAnimationActive={false}>
          {steps.map((step, index) => (
            <Cell key={index} fill={fillFor(step.kind)} />
          ))}
          <LabelList dataKey="amount" position="top" formatter={(v) => formatCompact(Number(v))} style={{ fontSize: 11, fontWeight: 600, fill: colors.axis }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
