"use client";

import { BusinessHour } from "@/types";
import { ORDERED_DAYS, groupBusinessHoursByDay, toHourMinute } from "@/lib/businessHours";

export function ClinicBusinessHours({ hours }: { hours: BusinessHour[] }) {
  const grouped = groupBusinessHoursByDay(hours);

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Horários de funcionamento</h2>
      <div className="divide-y divide-[#eef7f3] rounded-2xl border border-[#d7f3ea] bg-white shadow-sm dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
        {ORDERED_DAYS.map(({ value, label }) => {
          const ranges = grouped[value];
          return (
            <div key={value} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span className="font-medium text-[#0f172a] dark:text-white">{label}</span>
              {ranges.length === 0 ? (
                <span className="text-[#94a3b8] dark:text-slate-500">Fechado</span>
              ) : (
                <span className="text-right text-[#475569] dark:text-slate-300">
                  {ranges.map((r) => `${toHourMinute(r.startTime)} - ${toHourMinute(r.endTime)}`).join(", ")}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
