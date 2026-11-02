"use client";

import { useId, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";
import type { GetFinancialBalanceParams } from "../services/financial.service";

interface BalancePeriodFilterProps {
  onApply: (params: GetFinancialBalanceParams) => void;
}

const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

/** "2026-11-01" + "2026-11-30" → "1 a 30 de novembro de 2026". */
export function formatPeriod(start: string, end: string): string {
  const [sy, sm, sd] = start.split("T")[0].split("-").map(Number);
  const [ey, em, ed] = end.split("T")[0].split("-").map(Number);
  if (!sy || !ey) return "";
  if (sy === ey && sm === em) return `${sd} a ${ed} de ${MONTHS[em - 1]} de ${ey}`;
  if (sy === ey) return `${sd} de ${MONTHS[sm - 1]} a ${ed} de ${MONTHS[em - 1]} de ${ey}`;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(sd)}/${pad(sm)}/${sy} a ${pad(ed)}/${pad(em)}/${ey}`;
}

type PresetKey = "month" | "30d" | "7d" | "custom";

/** Data civil local (YYYY-MM-DD). `toISOString` usa UTC e vira o dia às 21h no Brasil. */
export function localIso(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function presetRange(key: Exclude<PresetKey, "custom">, now = new Date()): GetFinancialBalanceParams {
  // Sem datas, o back usa o mês corrente inteiro (inclui o que já está agendado até o fim do mês).
  if (key === "month") return {};
  const start = new Date(now);
  start.setDate(start.getDate() - (key === "7d" ? 6 : 29));
  return { startDate: localIso(start), endDate: localIso(now) };
}

const options: Array<{ key: PresetKey; label: string }> = [
  { key: "month", label: "Este mês" },
  { key: "30d", label: "30 dias" },
  { key: "7d", label: "7 dias" },
  { key: "custom", label: "Personalizado" },
];

const dateInput =
  "h-9 rounded-xl border border-[var(--color-gray-200)] bg-[var(--color-card)] px-3 font-mono text-sm text-[var(--color-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]";

export function BalancePeriodFilter({ onApply }: BalancePeriodFilterProps) {
  const layoutId = useId();
  const [active, setActive] = useState<PresetKey>("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const isInvalid = Boolean(startDate && endDate && startDate > endDate);

  const select = (key: PresetKey) => {
    setActive(key);
    if (key !== "custom") onApply(presetRange(key));
  };

  const applyCustom = () => {
    if (isInvalid) return;
    onApply({ startDate: startDate || undefined, endDate: endDate || undefined });
  };

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <div
        role="radiogroup"
        aria-label="Período"
        className="inline-flex rounded-xl border border-[var(--color-gray-200)] bg-[var(--color-card)] p-1"
      >
        {options.map((option) => {
          const selected = option.key === active;
          return (
            <button
              key={option.key}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => select(option.key)}
              className={cn(
                "relative inline-flex h-8 items-center rounded-lg px-3 text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
                selected
                  ? "text-[var(--color-primary-dark)] dark:text-[var(--color-primary-light)]"
                  : "text-[var(--color-gray-600)] hover:text-[var(--color-secondary)]",
              )}
            >
              {selected && (
                <motion.span
                  layoutId={layoutId}
                  transition={spring.ui}
                  className="absolute inset-0 rounded-lg bg-[var(--color-primary-muted)]"
                />
              )}
              <span className="relative">{option.label}</span>
            </button>
          );
        })}
      </div>

      {active === "custom" && (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            applyCustom();
          }}
        >
          <input aria-label="Data inicial" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={dateInput} />
          <span className="text-sm text-[var(--color-gray-600)]">até</span>
          <input aria-label="Data final" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={dateInput} />
          <Button type="submit" fullWidth={false} disabled={isInvalid || (!startDate && !endDate)}>
            Aplicar
          </Button>
          {isInvalid && (
            <p role="alert" className="basis-full text-xs text-red-600 dark:text-red-400">
              A data inicial deve ser anterior à data final.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
