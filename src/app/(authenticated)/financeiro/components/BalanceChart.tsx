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
  const [year, m] = month.split("-");
  const names = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
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
      <div className="bg-white border-2 border-[#1a2a4a] rounded-sm p-3 shadow-[4px_4px_0_0_#1a2a4a]">
        <p className="text-sm font-bold text-[#1a2a4a] mb-2" style={{ fontFamily: "var(--font-serif)" }}>
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
    <div className="bg-white rounded-sm border-2 border-[#e2ebe6] p-6 mb-6 shadow-[2px_2px_0_0_#e2ebe6]">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 
          className="text-lg font-bold text-[#1a2a4a]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Evolução Financeira
        </h3>
        <select
          value={period}
          onChange={(e) => onPeriodChange(Number(e.target.value) as HistoryPeriod)}
          className="px-3 py-2 bg-white border-2 border-[#e2ebe6] rounded-sm text-[#1a2a4a]
            focus:border-[#1a4a3a] focus:shadow-[2px_2px_0_0_#1a4a3a] focus:outline-none transition-all"
          style={{ fontFamily: "var(--font-serif)" }}
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
        <div className="h-80 flex items-center justify-center bg-[#f8faf9] border-2 border-dashed border-[#e2ebe6] rounded-sm">
          <p className="text-[#4a6354]" style={{ fontFamily: "var(--font-serif)" }}>
            Nenhum dado disponível para o período selecionado.
          </p>
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2ebe6" />
              <XAxis 
                dataKey="formattedMonth" 
                tick={{ fill: "#4a6354", fontSize: 12 }}
                axisLine={{ stroke: "#d0dcd4" }}
                tickLine={{ stroke: "#d0dcd4" }}
              />
              <YAxis 
                tick={{ fill: "#4a6354", fontSize: 12 }}
                axisLine={{ stroke: "#d0dcd4" }}
                tickLine={{ stroke: "#d0dcd4" }}
                tickFormatter={(value) => 
                  `R$ ${value.toLocaleString("pt-BR", { notation: "compact", compactDisplay: "short" })}`
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: 20 }}
                formatter={(value) => (
                  <span style={{ fontFamily: "var(--font-serif)", color: "#1a2a4a" }}>
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
