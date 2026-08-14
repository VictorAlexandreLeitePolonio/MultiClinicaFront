"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { GetFinancialBalanceParams } from "../services/financial.service";

interface BalancePeriodFilterProps {
  onApply: (params: GetFinancialBalanceParams) => void;
}

const toIso = (date: Date) => date.toISOString().slice(0, 10);

type PresetKey = "7d" | "30d" | "month" | "all" | "custom";

function presetRange(key: Exclude<PresetKey, "custom">): GetFinancialBalanceParams {
  const now = new Date();
  const end = toIso(now);
  if (key === "all") return {};
  if (key === "month") {
    return { startDate: toIso(new Date(now.getFullYear(), now.getMonth(), 1)), endDate: end };
  }
  const days = key === "7d" ? 6 : 29;
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  return { startDate: toIso(start), endDate: end };
}

const presets: Array<{ key: Exclude<PresetKey, "custom">; label: string }> = [
  { key: "all", label: "Tudo" },
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
  { key: "month", label: "Este mês" },
];

export function BalancePeriodFilter({ onApply }: BalancePeriodFilterProps) {
  const [active, setActive] = useState<PresetKey>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const isInvalid = Boolean(startDate && endDate && startDate > endDate);

  const selectPreset = (key: Exclude<PresetKey, "custom">) => {
    setActive(key);
    onApply(presetRange(key));
  };

  const applyCustom = () => {
    if (isInvalid) return;
    setActive("custom");
    onApply({ startDate: startDate || undefined, endDate: endDate || undefined });
  };

  const chipClass = (isActive: boolean) =>
    `rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
      isActive
        ? "bg-[#14b8a6] text-white shadow-sm"
        : "border border-[#d7f3ea] bg-white text-[#0f766e] hover:bg-[#ecfdf5] dark:border-slate-700 dark:bg-slate-900 dark:text-[#67e8f9] dark:hover:bg-slate-800"
    }`;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#d7f3ea] bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button key={preset.key} type="button" onClick={() => selectPreset(preset.key)} className={chipClass(active === preset.key)}>
            {preset.label}
          </button>
        ))}
        <button type="button" onClick={() => setActive("custom")} className={chipClass(active === "custom")}>
          Personalizado
        </button>
      </div>

      {active === "custom" && (
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <input
            aria-label="Data inicial"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="rounded-xl border border-[#d7f3ea] bg-white px-3 py-2 text-sm text-[#0f172a] focus:border-[#14b8a6] focus:outline-none focus:ring-4 focus:ring-[#99f6e4]/50 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
          <span className="text-sm text-[#64748b] dark:text-slate-400">até</span>
          <input
            aria-label="Data final"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="rounded-xl border border-[#d7f3ea] bg-white px-3 py-2 text-sm text-[#0f172a] focus:border-[#14b8a6] focus:outline-none focus:ring-4 focus:ring-[#99f6e4]/50 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
          <Button type="button" fullWidth={false} disabled={isInvalid} onClick={applyCustom}>Aplicar</Button>
          {isInvalid && <p className="basis-full text-xs text-red-600">A data inicial deve ser anterior à data final.</p>}
        </div>
      )}
    </div>
  );
}
