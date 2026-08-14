"use client";

import { useTheme } from "next-themes";

// Paleta validada pelo dataviz (light e dark passam todos os checks).
// status: verde / vermelho / azul / âmbar
const LIGHT = {
  surface: "#ffffff",
  grid: "#e2e8f0",
  axis: "#64748b",
  income: "#059669",
  cost: "#DC2626",
  result: "#0d9488",
  teal: "#0d9488",
  status: { completed: "#059669", cancelled: "#DC2626", scheduled: "#2563EB", noShow: "#D97706" },
};
const DARK = {
  surface: "#0f172a",
  grid: "#1e293b",
  axis: "#94a3b8",
  income: "#10B981",
  cost: "#F43F5E",
  result: "#2dd4bf",
  teal: "#2dd4bf",
  status: { completed: "#059669", cancelled: "#F43F5E", scheduled: "#3B82F6", noShow: "#D97706" },
};

export type ChartColors = typeof LIGHT;

export function useChartColors(): { colors: ChartColors; isDark: boolean } {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  return { colors: isDark ? DARK : LIGHT, isDark };
}

export function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-[#d7f3ea] bg-white p-5 shadow-[0_18px_50px_-42px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900 ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-bold text-[#0f172a] dark:text-white">{title}</h3>
        {subtitle && <p className="text-xs text-[#64748b] dark:text-slate-400">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

// Tooltip consistente para todos os gráficos (dark-aware via classes).
export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string; payload?: Record<string, unknown> }>;
  label?: string;
  formatter: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[#d7f3ea] bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
      {label && <p className="mb-1 font-semibold text-[#0f172a] dark:text-white">{label}</p>}
      {payload.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {item.color && <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />}
          <span className="text-[#64748b] dark:text-slate-300">{item.name}</span>
          <span className="ml-auto font-semibold text-[#0f172a] dark:text-white">{formatter(item.value ?? 0)}</span>
        </div>
      ))}
    </div>
  );
}

export function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[260px] items-center justify-center text-sm text-[#64748b] dark:text-slate-400">
      {message}
    </div>
  );
}
