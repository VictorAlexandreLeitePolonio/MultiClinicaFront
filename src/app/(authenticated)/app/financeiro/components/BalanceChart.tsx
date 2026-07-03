"use client";

import { FinancialBalance } from "@/types";
import { HistoryPeriod } from "../hooks/balanceHistory";
import { formatCurrency } from "@/utils/formatters";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface BalanceChartProps {
  data: FinancialBalance[];
  loading: boolean;
  period: HistoryPeriod;
  onPeriodChange: (p: HistoryPeriod) => void;
}

// Utilitário para formatar o mês no eixo X
const formatMonth = (month: string) => {
  const [first, second] = month.split("-");
  const isYearFirst = first.length === 4;
  const year = isYearFirst ? first : second;
  const m = isYearFirst ? second : first;
  const names = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  if (!year || !m) return month;
  return `${names[parseInt(m) - 1]}/${year.slice(2)}`;
};

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { color: string; name: string; value: number }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-3 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.42)]">
        <p className="text-sm font-bold text-secondary dark:text-white mb-2">
          {label}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function BalanceChart({ data, loading, period, onPeriodChange }: BalanceChartProps) {
  // Formatar dados para o gráfico
  const chartData = data.map((item) => ({
    ...item,
    formattedMonth: formatMonth(item.referenceMonth),
  }));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 mb-6 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.42)]">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="text-lg font-bold text-secondary dark:text-white">
          Evolução Financeira
        </h3>
        <select
          value={period}
          onChange={(e) => onPeriodChange(Number(e.target.value) as HistoryPeriod)}
          className="px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-secondary dark:text-white
            focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
        >
          <option value={1}>Último mês</option>
          <option value={3}>Últimos 3 meses</option>
          <option value={6}>Últimos 6 meses</option>
          <option value={12}>Último ano</option>
        </select>
      </div>

      {/* Gráfico */}
      {loading ? (
        <div className="h-80">
          <Skeleton className="w-full h-full" />
        </div>
      ) : data.length === 0 ? (
        <div className="h-80 flex items-center justify-center bg-gray-50 dark:bg-slate-900 border border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
          <p className="text-gray-600 dark:text-slate-300">
            Nenhum dado disponível para o período selecionado.
          </p>
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" />
              <XAxis
                dataKey="formattedMonth"
                tick={{ fill: "var(--color-gray-600)", fontSize: 12 }}
                axisLine={{ stroke: "var(--color-gray-200)" }}
                tickLine={{ stroke: "var(--color-gray-200)" }}
              />
              <YAxis
                tick={{ fill: "var(--color-gray-600)", fontSize: 12 }}
                axisLine={{ stroke: "var(--color-gray-200)" }}
                tickLine={{ stroke: "var(--color-gray-200)" }}
                tickFormatter={(value) => 
                  `R$ ${value.toLocaleString("pt-BR", { notation: "compact", compactDisplay: "short" })}`
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: 20 }}
                formatter={(value) => (
                  <span style={{ color: "var(--color-secondary)" }}>
                    {value}
                  </span>
                )}
              />
              <Line 
                type="monotone" 
                dataKey="totalIncome" 
                name="Entradas"
                stroke="#16a34a" 
                strokeWidth={2}
                dot={{ fill: "#16a34a", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="totalExpenses" 
                name="Saídas"
                stroke="#dc2626" 
                strokeWidth={2}
                dot={{ fill: "#dc2626", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="netBalance" 
                name="Saldo"
                stroke="#2563eb" 
                strokeWidth={2}
                dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
