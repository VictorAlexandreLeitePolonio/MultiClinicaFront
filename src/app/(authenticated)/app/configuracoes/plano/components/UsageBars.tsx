"use client";

import { METRIC_LABELS, UsageResponse } from "@/lib/plans";

interface UsageBarsProps {
  usage: UsageResponse;
}

export function UsageBars({ usage }: UsageBarsProps) {
  const metrics = usage.metrics.filter((metric) => metric.total > 0);

  if (metrics.length === 0) return null;

  return (
    <div className="space-y-5">
      {metrics.map((metric) => {
        const ratio = metric.used / metric.total;
        const percent = Math.min(100, Math.round(ratio * 100));
        const alert = ratio >= 0.8;

        return (
          <div key={metric.metric}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-[#0f172a] dark:text-white">
                {METRIC_LABELS[metric.metric]}
              </span>
              <span
                className={
                  alert
                    ? "font-semibold text-amber-700 dark:text-amber-300"
                    : "text-[#64748b] dark:text-slate-300"
                }
              >
                {metric.used} de {metric.total}
              </span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#e2e8f0] dark:bg-slate-800">
              <div
                role="progressbar"
                aria-label={METRIC_LABELS[metric.metric]}
                aria-valuemin={0}
                aria-valuemax={metric.total}
                aria-valuenow={metric.used}
                aria-valuetext={`${metric.used} de ${metric.total}`}
                data-alert={alert ? "true" : "false"}
                className={`h-full rounded-full transition-all ${
                  alert ? "bg-amber-500" : "bg-[#14b8a6]"
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
            {metric.extraGranted > 0 && (
              <p className="mt-1 text-xs text-[#64748b] dark:text-slate-400">
                inclui +{metric.extraGranted} de pacote (válido até o fim do mês)
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
