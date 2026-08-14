"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { BalanceAppointmentsSummary } from "@/types";
import { ChartTooltip, EmptyChart, useChartColors } from "./chartKit";

interface Props {
  appointments: BalanceAppointmentsSummary;
}

export function BalanceAppointmentsDonut({ appointments }: Props) {
  const { colors } = useChartColors();
  const slices = [
    { name: "Realizadas", value: appointments.completed, color: colors.status.completed },
    { name: "Agendadas", value: appointments.scheduled, color: colors.status.scheduled },
    { name: "Canceladas", value: appointments.cancelled, color: colors.status.cancelled },
    { name: "Faltas", value: appointments.noShow, color: colors.status.noShow },
  ].filter((slice) => slice.value > 0);

  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  if (total === 0) return <EmptyChart message="Nenhuma consulta no período." />;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative h-[300px] w-[300px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={slices} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={86} outerRadius={128} paddingAngle={2} stroke="none" isAnimationActive={false}>
              {slices.map((slice, index) => (
                <Cell key={index} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip content={({ active, payload }) => <ChartTooltip active={active} payload={payload as never} formatter={(v) => `${v} (${Math.round((v / total) * 100)}%)`} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-[#0f172a] dark:text-white">{total}</span>
          <span className="text-xs text-[#64748b] dark:text-slate-400">consultas</span>
        </div>
      </div>
      <ul className="flex-1 space-y-3">
        {slices.map((slice) => (
          <li key={slice.name} className="flex items-center gap-2 text-sm">
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: slice.color }} />
            <span className="text-[#0f172a] dark:text-slate-200">{slice.name}</span>
            <span className="ml-auto font-semibold text-[#0f172a] dark:text-white">{slice.value}</span>
            <span className="w-10 text-right text-xs text-[#64748b] dark:text-slate-400">{Math.round((slice.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
