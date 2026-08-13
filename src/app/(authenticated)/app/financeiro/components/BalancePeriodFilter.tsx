"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { GetFinancialBalanceParams } from "../services/financial.service";

interface BalancePeriodFilterProps {
  onApply: (params: GetFinancialBalanceParams) => void;
}

export function BalancePeriodFilter({ onApply }: BalancePeriodFilterProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const isInvalid = Boolean(startDate && endDate && startDate > endDate);

  const apply = () => {
    if (!isInvalid) onApply({ startDate: startDate || undefined, endDate: endDate || undefined });
  };

  const clear = () => {
    setStartDate("");
    setEndDate("");
    onApply({});
  };

  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-1 text-xs font-semibold text-[#64748b] dark:text-slate-300">
        Data inicial
        <input
          aria-label="Data inicial"
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          className="rounded-xl border border-[#d7f3ea] bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-semibold text-[#64748b] dark:text-slate-300">
        Data final
        <input
          aria-label="Data final"
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
          className="rounded-xl border border-[#d7f3ea] bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </label>
      <Button type="button" disabled={isInvalid} onClick={apply}>Aplicar</Button>
      <Button type="button" variant="outline" onClick={clear}>Limpar</Button>
      {isInvalid && <p className="basis-full text-xs text-red-600">A data inicial deve ser anterior à data final.</p>}
    </div>
  );
}
