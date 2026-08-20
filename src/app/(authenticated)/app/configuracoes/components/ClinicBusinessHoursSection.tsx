"use client";

import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { getApiErrorMessage } from "@/utils/apiError";
import { BusinessHour, DayOfWeekName } from "@/types";
import { useAddBusinessHour, useBusinessHours, useDeleteBusinessHour } from "../hooks/useClinicProfile";

interface Props {
  canEdit: boolean;
}

const DAYS: { value: DayOfWeekName; label: string }[] = [
  { value: "Monday", label: "Segunda" },
  { value: "Tuesday", label: "Terça" },
  { value: "Wednesday", label: "Quarta" },
  { value: "Thursday", label: "Quinta" },
  { value: "Friday", label: "Sexta" },
  { value: "Saturday", label: "Sábado" },
  { value: "Sunday", label: "Domingo" },
];

const hhmm = (time: string) => time.slice(0, 5);

export function ClinicBusinessHoursSection({ canEdit }: Props) {
  const hoursQuery = useBusinessHours();
  const addHour = useAddBusinessHour();
  const deleteHour = useDeleteBusinessHour();

  const [day, setDay] = useState<DayOfWeekName>("Monday");
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("12:00");

  const byDay = (value: DayOfWeekName): BusinessHour[] =>
    (hoursQuery.data ?? [])
      .filter((h) => h.dayOfWeek === value)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleAdd = async () => {
    if (start >= end) {
      toast.error("O horário inicial deve ser menor que o final.");
      return;
    }
    try {
      await addHour.mutateAsync({ dayOfWeek: day, startTime: `${start}:00`, endTime: `${end}:00` });
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Não foi possível adicionar a faixa."));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteHour.mutateAsync(id);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Não foi possível remover a faixa."));
    }
  };

  const inputClass =
    "rounded-xl border border-[#d7f3ea] bg-white px-3 py-2 text-sm text-[#0f172a] focus:border-[#14b8a6] focus:outline-none focus:ring-4 focus:ring-[#99f6e4]/50 dark:border-slate-800 dark:bg-slate-900 dark:text-white";

  return (
    <section className="space-y-5 rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Horários de funcionamento</h2>
        <p className="mt-1 text-sm text-[#64748b] dark:text-slate-400">
          Adicione uma ou mais faixas de horário por dia.
        </p>
      </div>

      <div className="space-y-3">
        {DAYS.map(({ value, label }) => {
          const ranges = byDay(value);
          return (
            <div key={value} className="flex flex-col gap-2 border-b border-[#eef7f3] pb-3 last:border-0 dark:border-slate-800 sm:flex-row sm:items-center">
              <span className="w-24 text-sm font-semibold text-[#0f172a] dark:text-white">{label}</span>
              {ranges.length === 0 ? (
                <span className="text-sm text-[#94a3b8] dark:text-slate-500">Fechado</span>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {ranges.map((range) => (
                    <span
                      key={range.id}
                      className="flex items-center gap-2 rounded-lg bg-[#ecfdf5] px-2.5 py-1 text-sm text-[#0f766e] dark:bg-slate-800 dark:text-[#67e8f9]"
                    >
                      {hhmm(range.startTime)} - {hhmm(range.endTime)}
                      {canEdit && (
                        <button
                          type="button"
                          aria-label="Remover faixa"
                          onClick={() => handleDelete(range.id)}
                          className="text-[#0f766e]/70 hover:text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {canEdit && (
        <div className="flex flex-wrap items-end gap-3 rounded-xl bg-[#f8fafc] p-4 dark:bg-slate-800/50">
          <label className="flex flex-col gap-1 text-xs font-semibold text-[#475569] dark:text-slate-300">
            Dia
            <select value={day} onChange={(e) => setDay(e.target.value as DayOfWeekName)} className={inputClass}>
              {DAYS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-[#475569] dark:text-slate-300">
            Início
            <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-[#475569] dark:text-slate-300">
            Fim
            <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className={inputClass} />
          </label>
          <Button type="button" fullWidth={false} loading={addHour.isPending} onClick={handleAdd}>
            <Plus size={16} />
            Adicionar faixa
          </Button>
        </div>
      )}
    </section>
  );
}
